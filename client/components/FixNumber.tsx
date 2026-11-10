'use client';

import { useState } from 'react';

export default function FixNumber() {
  const [fixed, setFixed] = useState(false);
  return (
    <div className="fixcard rv">
      <p className="lbl">Transcript</p>
      <p className="say">
        “Bhai, maine online ₹
        <button
          className={`num${fixed ? ' fixed' : ''}`}
          onClick={() => setFixed((f) => !f)}
          aria-label="Number heard as 30,000. Tap to correct it to 3,000."
        >
          {fixed ? '3,000' : '30,000'}
        </button>{' '}
        ka phone order kiya tha, aur seller refund nahi de raha.”
      </p>
      <p className="fixnote">
        {fixed ? 'Theek ho gaya. Ab jawab ₹3,000 ke order par banega.' : 'Yeh number galat suna gaya? Us par tap karo.'}
      </p>
    </div>
  );
}
