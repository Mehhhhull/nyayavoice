export type Key = 'consumer';

export type Scenario = {
  say: string;
  mark: string;
  steps: string[];
  src: [string, string][];
  draft: string;
  c: {
    quote: string;
    who: string;
    asks: string[];
    keep: string[];
    no: string[];
    ch: [string, string];
  };
};

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://your-domain.com';

export const LINKS = {
  helpline: 'https://consumerhelpline.gov.in/',
  act: 'https://www.indiacode.nic.in/indiacode/handle/123456789/15256',
};

export const DATA: Record<Key, Scenario> = {
  consumer: {
    say: 'Bhai, maine online ₹3,000 ka phone order kiya tha. Phone defective hai, aur seller refund dene se mana kar raha hai. Ab kya karun?',
    mark: '₹3,000',
    steps: [
      'Invoice, order ID aur defect ki photo ya video ek jagah rakho.',
      'Seller ko refund ki maang likhit mein bhejo, taaki record rahe.',
      'Jawab na mile to National Consumer Helpline par shikayat darj karo (portal ya 1915).',
    ],
    src: [
      ['National Consumer Helpline', LINKS.helpline],
      ['Consumer Protection Act, 2019', LINKS.act],
    ],
    draft:
      'To,\nThe Seller / Grievance Officer\n\nSubject: Refund request for defective product (Order ID: [order ID])\n\nI ordered [product] on [date] for ₹3,000. The product arrived defective: [describe defect]. I request a refund. Invoice and photos are attached.\n\n[Your name] · [Contact]',
    c: {
      quote: '“Phone defective hai aur seller refund dene se mana kar raha hai.”',
      who: 'Online shopper',
      asks: ['Order kab kiya tha?', 'Seller ne likh kar kya jawab diya?', 'Aap kya chahte ho: refund ya replacement?'],
      keep: ['Invoice aur order confirmation', 'Defect ki photo ya video', 'Seller ke saath chat ya email', 'Warranty ya return policy'],
      no: ['Refund milne ka vaada nahi', 'Aapke dawe ko bina sabut sahi nahi maanta'],
      ch: ['National Consumer Helpline', LINKS.helpline],
    },
  },
};

export const PHRASES = [
  'Seller reply nahi de raha',
  'Refund ka paisa wapas nahi aaya',
  'Warranty mein repair se mana kar diya',
  'Galat item aa gaya',
  'Order cancel hua, paisa kat gaya',
  'Helpline kahan karun?',
  'Shikayat kaise likhte hain?',
];

export const FAQ: { q: string; a: string }[] = [
  {
    q: 'Defective product ka refund seller na de to kya karein?',
    a: 'Pehle invoice, order ID aur defect ki photo ya video sambhal ke rakho, phir seller ko refund ki maang likhit mein bhejo. Jawab na mile ya mana kar de, to National Consumer Helpline (portal ya 1915) par shikayat darj kar sakte ho. NyayaVoice yeh steps official source ke saath dikhata hai aur shikayat ka draft taiyaar karta hai.',
  },
  {
    q: 'Kya NyayaVoice mera case lad sakta hai?',
    a: 'Nahi. NyayaVoice vakeel nahi hai aur legal advice ya kisi nateeje ki guarantee nahi deta. Yeh general jankari, agle kadam, evidence checklist aur draft deta hai. Shikayat aap khud, official channel par karte ho.',
  },
  {
    q: 'Mera voice data safe hai?',
    a: 'NyayaVoice aise banaya ja raha hai ki account na maange aur raw audio ya poora transcript default roop se log na kare. Transcription ke liye audio ek hosted speech service (Gnani Prisma) ko bheji jaati hai, isliye bhejne se pehle aapko bataya jayega. Demo mein sirf kalpanik naam aur numbers use karo.',
  },
  {
    q: 'Kya yeh internet ke bina chalta hai?',
    a: 'Nahi. Speech recognition aur spoken answer hosted service se aate hain, isliye internet chahiye.',
  },
  {
    q: 'Kaun si bhasha chalti hai?',
    a: 'Hindi, Hinglish aur English se shuru. Bengali agla kadam hai, par tabhi jodenge jab poora voice flow test ho jaye.',
  },
  {
    q: 'Kya NyayaVoice shikayat khud submit kar deta hai?',
    a: 'Nahi. Yeh draft aur checklist banata hai. Bhejna, copy karna aur official portal par jaana aapke haath mein rehta hai.',
  },
  {
    q: 'Jawab kahan se aate hain?',
    a: 'Chuni hui official sources se: Consumer Protection Act, 2019 (India Code) aur National Consumer Helpline. Har important baat ke saath source ka link hota hai. Source na mile to NyayaVoice saaf bolta hai ki woh verify nahi kar paya.',
  },
];
