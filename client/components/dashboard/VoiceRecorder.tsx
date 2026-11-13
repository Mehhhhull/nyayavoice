'use client';

import { useEffect, useRef, useState } from 'react';

type VoiceMode = 'text' | 'voice';

type Props = {
  mode: VoiceMode;
  variant?: 'inline' | 'voice';
  disabled?: boolean;
  onSubmit: (audio: Blob, mode: VoiceMode) => Promise<void>;
};

function stopTracks(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function encodeWav(chunks: Float32Array[], sampleRate: number): Blob {
  const sampleCount = chunks.reduce((count, chunk) => count + chunk.length, 0);
  const buffer = new ArrayBuffer(44 + sampleCount * 2);
  const view = new DataView(buffer);
  const writeText = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeText(0, 'RIFF');
  view.setUint32(4, 36 + sampleCount * 2, true);
  writeText(8, 'WAVE');
  writeText(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(36, 'data');
  view.setUint32(40, sampleCount * 2, true);

  let offset = 44;
  for (const chunk of chunks) {
    for (const value of chunk) {
      const sample = Math.max(-1, Math.min(1, value));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

export default function VoiceRecorder({
  mode,
  variant = 'inline',
  disabled = false,
  onSubmit,
}: Props) {
  const [recording, setRecording] = useState(false);
  const [starting, setStarting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const silentGainRef = useRef<GainNode | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  const cancelledRef = useRef(false);

  const releaseCapture = () => {
    const processor = processorRef.current;
    if (processor) {
      processor.onaudioprocess = null;
      processor.disconnect();
      processorRef.current = null;
    }
    sourceRef.current?.disconnect();
    sourceRef.current = null;
    silentGainRef.current?.disconnect();
    silentGainRef.current = null;
    stopTracks(streamRef.current);
    streamRef.current = null;

    const context = audioContextRef.current;
    audioContextRef.current = null;
    if (context && context.state !== 'closed') {
      void context.close();
    }
  };

  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
      releaseCapture();
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof AudioContext === 'undefined') {
      setError('Audio recording is not supported in this browser.');
      return;
    }

    setStarting(true);
    try {
      const context = new AudioContext();
      audioContextRef.current = context;
      await context.resume();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (cancelledRef.current) {
        stopTracks(stream);
        releaseCapture();
        return;
      }
      streamRef.current = stream;
      chunksRef.current = [];
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(4096, 1, 1);
      const silentGain = context.createGain();
      silentGain.gain.value = 0;
      processor.onaudioprocess = (event) => {
        chunksRef.current.push(new Float32Array(event.inputBuffer.getChannelData(0)));
      };
      sourceRef.current = source;
      processorRef.current = processor;
      silentGainRef.current = silentGain;
      source.connect(processor);
      processor.connect(silentGain);
      silentGain.connect(context.destination);
      setRecording(true);
    } catch (reason: unknown) {
      releaseCapture();
      if (!cancelledRef.current) {
        setError(
          reason instanceof Error && reason.name === 'NotAllowedError'
            ? 'Microphone access was denied. Allow microphone access and try again.'
            : 'Could not start the microphone. Please try again.',
        );
      }
    } finally {
      if (!cancelledRef.current) setStarting(false);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    const sampleRate = audioContextRef.current?.sampleRate;
    const chunks = chunksRef.current;
    chunksRef.current = [];
    releaseCapture();
    setRecording(false);

    if (!sampleRate || chunks.length === 0) {
      setError('No audio was recorded. Please try again.');
      return;
    }

    setProcessing(true);
    try {
      await onSubmit(encodeWav(chunks, sampleRate), mode);
    } catch (reason) {
      if (!cancelledRef.current) {
        setError(reason instanceof Error ? reason.message : 'Could not process your recording.');
      }
    } finally {
      if (!cancelledRef.current) setProcessing(false);
    }
  };

  const control = (
    <button
      type="button"
      className={`dashboard-record-button${recording ? ' is-recording' : ''}${variant === 'inline' ? ' is-icon' : ''}`}
      disabled={starting || processing || (disabled && !recording)}
      onClick={recording ? stopRecording : startRecording}
      aria-label={
        recording
          ? 'Stop recording and send'
          : mode === 'voice'
            ? 'Start voice conversation'
            : 'Ask by voice and receive a text reply'
      }
      title={
        mode === 'voice'
          ? 'Start voice conversation'
          : 'Speak your question and receive a text reply'
      }
    >
      {starting || processing ? (
        <span className="dashboard-spinner" aria-hidden="true" />
      ) : recording ? (
        <span className="dashboard-stop-icon" aria-hidden="true" />
      ) : (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="9" y="3" width="6" height="12" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8" />
        </svg>
      )}
      {variant === 'voice' && (
        <span>
          {recording ? 'Stop and send' : starting ? 'Connecting…' : processing ? 'Thinking…' : 'Start speaking'}
        </span>
      )}
    </button>
  );

  if (variant === 'inline') {
    return (
      <div className="dashboard-inline-voice">
        {control}
        {error && <span className="dashboard-inline-error" role="alert">{error}</span>}
      </div>
    );
  }

  return (
    <div className={`dashboard-live-recorder${recording ? ' is-recording' : ''}`}>
      <div className="dashboard-live-orb" aria-hidden="true">
        <span />
      </div>
      <p className="dashboard-live-status" aria-live="polite">
        {recording
          ? 'Listening… Speak naturally, then stop when you’re done.'
          : starting
            ? 'Connecting to your microphone…'
          : processing
            ? 'Preparing your spoken answer…'
            : 'A voice conversation about your consumer-rights question'}
      </p>
      {control}
      {error && <p className="dashboard-error" role="alert">{error}</p>}
    </div>
  );
}
