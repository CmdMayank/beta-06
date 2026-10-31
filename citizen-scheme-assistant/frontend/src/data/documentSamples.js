/**
 * Know Your Documents - Centralized Document Sample Registry & Matching
 *
 * SAFETY INVARIANTS:
 * - Specimens are strictly fictional representations for citizen literacy.
 * - No real citizen identities, valid Aadhaar numbers, or bank accounts are ever used.
 * - Prominent "SAMPLE – NOT VALID" watermark on every specimen.
 * - Explicit note that formats vary across states/districts.
 *
 * ONLY 7 DOCUMENT TYPES ARE SUPPORTED:
 * 1. AADHAAR_CARD
 * 2. INCOME_CERTIFICATE
 * 3. CASTE_CERTIFICATE
 * 4. SAMAGRA_ID
 * 5. DOMICILE_CERTIFICATE
 * 6. RATION_CARD
 * 7. BANK_PASSBOOK
 */

export const SUPPORTED_DOCUMENT_TYPES = {
  AADHAAR_CARD: 'AADHAAR_CARD',
  INCOME_CERTIFICATE: 'INCOME_CERTIFICATE',
  CASTE_CERTIFICATE: 'CASTE_CERTIFICATE',
  SAMAGRA_ID: 'SAMAGRA_ID',
  DOMICILE_CERTIFICATE: 'DOMICILE_CERTIFICATE',
  RATION_CARD: 'RATION_CARD',
  BANK_PASSBOOK: 'BANK_PASSBOOK',
  MARKSHEET: 'MARKSHEET',
};

export const DOCUMENT_SAMPLE_REGISTRY = {
  [SUPPORTED_DOCUMENT_TYPES.AADHAAR_CARD]: {
    type: SUPPORTED_DOCUMENT_TYPES.AADHAAR_CARD,
    sampleImage: '/samples/aadhaar-sample.svg',
    name: {
      en: 'Aadhaar Card',
      hi: 'आधार कार्ड',
    },
    category: {
      en: 'Universal Identity & Address Proof',
      hi: 'सार्वभौमिक पहचान एवं पता प्रमाण',
    },
    purpose: {
      en: 'Serves as primary proof of identity and address across India, and acts as the financial identifier for Direct Benefit Transfer (DBT) subsidy payments.',
      hi: 'भारत भर में पहचान और पते का प्राथमिक प्रमाण है, तथा प्रत्यक्ष लाभ अंतरण (DBT) सब्सिडी भुगतान के लिए मुख्य वित्तीय पहचानकर्ता के रूप में कार्य करता है।',
    },
    issuingAuthority: {
      en: 'Unique Identification Authority of India (UIDAI), Ministry of Electronics & IT',
      hi: 'भारतीय विशिष्ट पहचान प्राधिकरण (UIDAI), इलेक्ट्रॉनिकी एवं सूचना प्रौद्योगिकी मंत्रालय',
    },
    whereToObtain: {
      en: 'Visit any Aadhaar Seva Kendra, post office, designated bank branch, or download an e-Aadhaar PDF from the official UIDAI website (myaadhaar.uidai.gov.in).',
      hi: 'किसी भी आधार सेवा केंद्र, डाकघर, नामित बैंक शाखा से प्राप्त करें, अथवा UIDAI के आधिकारिक पोर्टल (myaadhaar.uidai.gov.in) से ई-आधार डाउनलोड करें।',
    },
    importantChecks: [
      {
        title: {
          en: 'Active Mobile Number Linkage',
          hi: 'सक्रिय मोबाइल नंबर लिंक होना',
        },
        desc: {
          en: 'Your mobile number must be linked and active to receive OTPs during online application and DBT authentication.',
          hi: 'ऑनलाइन आवेदन और DBT प्रमाणीकरण के समय OTP प्राप्त करने के लिए आपका मोबाइल नंबर आधार से लिंक होना अनिवार्य है।',
        },
      },
      {
        title: {
          en: 'Exact Name Spelling & DOB',
          hi: 'नाम की स्पेलिंग व जन्म तिथि',
        },
        desc: {
          en: 'Your name, date of birth, and gender must match your bank passbook and educational records exactly.',
          hi: 'आपका नाम, जन्म तिथि और लिंग बैंक पासबुक और शैक्षणिक दस्तावेजों से अक्षरशः मेल खाना चाहिए।',
        },
      },
      {
        title: {
          en: 'Biometric Update for Minors',
          hi: 'नाबालिगों का अनिवार्य बायोमेट्रिक अपडेट',
        },
        desc: {
          en: 'Mandatory biometric updates are required at age 5 and 15 to prevent scheme application rejections.',
          hi: '5 वर्ष और 15 वर्ष की आयु पूरी होने पर आधार सेवा केंद्र में बायोमेट्रिक अपडेट कराना ज़रूरी है।',
        },
      },
    ],
    formatDisclaimer: {
      en: 'Aadhaar comes in multiple valid official forms: Physical Letter, PVC Card, e-Aadhaar PDF, and Masked Aadhaar. All formats are equally valid by law.',
      hi: 'आधार पत्र, पीवीसी कार्ड, ई-आधार और मास्क्ड आधार सभी कानूनी रूप से समान रूप से मान्य हैं।',
    },
  },

  [SUPPORTED_DOCUMENT_TYPES.INCOME_CERTIFICATE]: {
    type: SUPPORTED_DOCUMENT_TYPES.INCOME_CERTIFICATE,
    sampleImage: '/samples/income-certificate-sample.svg',
    name: {
      en: 'Income Certificate',
      hi: 'आय प्रमाण पत्र',
    },
    category: {
      en: 'Financial & Means Verification',
      hi: 'आर्थिक व आय सत्यापन प्रमाण',
    },
    purpose: {
      en: 'Certifies the total annual income of the applicant’s entire family from all sources, used to verify income limits for scholarships, pensions, and subsidies.',
      hi: 'आवेदक के परिवार की समस्त स्रोतों से कुल वार्षिक आय प्रमाणित करता है। छात्रवृत्ति, पेंशन और सब्सिडी पात्रता तय करने के लिए आवश्यक है।',
    },
    issuingAuthority: {
      en: 'Revenue Department / Tehsildar / Sub-Divisional Magistrate (SDM) of your State',
      hi: 'संबंधित राज्य का राजस्व विभाग / तहसीलदार / अनुविभागीय दंडाधिकारी (SDM)',
    },
    whereToObtain: {
      en: 'Apply through your state E-District / Public Service Portal (e.g., MP e-District, edistrict.delhi.gov.in, etc.) or Common Service Centres (CSC).',
      hi: 'राज्य के ई-डिस्ट्रिक्ट पोर्टल (जैसे MP e-District, ई-डिस्ट्रिक्ट यूपी/बिहार आदि) या लोक सेवा केंद्र / CSC से ऑनलाइन आवेदन करें।',
    },
    importantChecks: [
      {
        title: {
          en: 'Validity Period',
          hi: 'प्रमाण पत्र की वैधता अवधि',
        },
        desc: {
          en: 'Income certificates are typically valid for 1 year or 3 years depending on state rules. Check that it has not expired.',
          hi: 'अधिकांश राज्यों में आय प्रमाण पत्र 1 वर्ष अथवा 3 वर्ष के लिए मान्य होता है। आवेदन से पूर्व वैधता तिथि अवश्य जांचें।',
        },
      },
      {
        title: {
          en: 'Digital Signature & Barcode',
          hi: 'डिजिटल हस्ताक्षर एवं बारकोड',
        },
        desc: {
          en: 'Modern income certificates feature a verifiable QR code or digital signature seal of the Tehsildar.',
          hi: 'आधुनिक प्रमाण पत्रों पर तहसीलदार का डिजिटल हस्ताक्षर व ऑनलाइन सत्यापन हेतु बारकोड/QR कोड होना चाहिए।',
        },
      },
      {
        title: {
          en: 'Total Household Income Figure',
          hi: 'कुल पारिवारिक आय की राशि',
        },
        desc: {
          en: 'Ensure the annual income specified does not exceed the maximum threshold defined for the welfare scheme.',
          hi: 'सुनिश्चित करें कि प्रमाण पत्र में दर्ज वार्षिक आय योजना की अधिकतम पात्रता सीमा के भीतर हो।',
        },
      },
    ],
    formatDisclaimer: {
      en: 'Income certificate layouts, seals, and colors differ by state and revenue circle. Digital copies with verification numbers are officially accepted everywhere.',
      hi: 'आय प्रमाण पत्र का प्रारूप, मुहर और रंग अलग-अलग राज्यों में भिन्न हो सकते हैं। सत्यापन क्रमांक वाले डिजिटल प्रमाण पत्र सभी जगह मान्य हैं।',
    },
  },

  [SUPPORTED_DOCUMENT_TYPES.CASTE_CERTIFICATE]: {
    type: SUPPORTED_DOCUMENT_TYPES.CASTE_CERTIFICATE,
    sampleImage: '/samples/caste-certificate-sample.svg',
    name: {
      en: 'Caste / Category Certificate',
      hi: 'जाति प्रमाण पत्र',
    },
    category: {
      en: 'Social Category Proof',
      hi: 'सामाजिक श्रेणी प्रमाण',
    },
    purpose: {
      en: 'Validates belonging to SC, ST, or OBC categories for reservation benefits, fee exemptions, and affirmative action welfare schemes.',
      hi: 'अनुसूचित जाति (SC), अनुसूचित जनजाति (ST), या अन्य पिछड़ा वर्ग (OBC) श्रेणी की पुष्टि करता है जिससे आरक्षण व विशेष योजनाओं का लाभ मिलता है।',
    },
    issuingAuthority: {
      en: 'Office of the Sub-Divisional Officer (SDO) / Tehsildar / District Magistrate',
      hi: 'अनुविभागीय अधिकारी (SDO) / तहसीलदार / जिला दंडाधिकारी कार्यालय',
    },
    whereToObtain: {
      en: 'Apply through state government public service portals or at local Tehsil offices / CSC centers with father’s ancestry proof.',
      hi: 'राज्य के लोक सेवा गारंटी केंद्र, ई-डिस्ट्रिक्ट पोर्टल या तहसील कार्यालय में पैतृक दस्तावेजों के साथ आवेदन करें।',
    },
    importantChecks: [
      {
        title: {
          en: 'Exact Category Notation',
          hi: 'स्पष्ट जाति एवं वर्ग का उल्लेख',
        },
        desc: {
          en: 'Verify that the certificate specifies SC, ST, or OBC in accordance with state/central reservation lists.',
          hi: 'प्रमाण पत्र में दर्ज जाति व उप-जाति राज्य या केंद्र सरकार की अधिकृत सूची के अनुसार होनी चाहिए।',
        },
      },
      {
        title: {
          en: 'Non-Creamy Layer (for OBC)',
          hi: 'ओबीसी हेतु नॉन-क्रीमी लेयर क्लॉज',
        },
        desc: {
          en: 'For OBC certificates, central schemes usually require a recent Non-Creamy Layer (NCL) certificate issued within the current fiscal year.',
          hi: 'ओबीसी वर्ग के लिए केंद्रीय योजनाओं में अक्सर चालू वित्तीय वर्ष का नॉन-क्रीमी लेयर प्रमाण आवश्यक होता है।',
        },
      },
    ],
    formatDisclaimer: {
      en: 'SC/ST certificates are generally valid for life, while OBC Non-Creamy Layer certificates require periodic renewal according to state guidelines.',
      hi: 'SC/ST प्रमाण पत्र आमतौर पर आजीवन मान्य होते हैं, जबकि OBC नॉन-क्रीमी लेयर प्रमाण पत्र को नियमानुसार नवीनीकृत कराना पड़ता है।',
    },
  },

  [SUPPORTED_DOCUMENT_TYPES.SAMAGRA_ID]: {
    type: SUPPORTED_DOCUMENT_TYPES.SAMAGRA_ID,
    sampleImage: '/samples/samagra-id-sample.jpg',
    name: {
      en: 'Samagra ID (Madhya Pradesh)',
      hi: 'समग्र आईडी (मध्य प्रदेश)',
    },
    category: {
      en: 'State Citizen Welfare Registry',
      hi: 'राज्य नागरिक परिवार डेटाबेस',
    },
    purpose: {
      en: 'The universal citizen and family database of Madhya Pradesh. Essential for Ladli Behna Yojana, state pensions, ration delivery, and school admissions.',
      hi: 'मध्य प्रदेश शासन का सार्वभौमिक परिवार व नागरिक डेटाबेस। लाड़ली बहना, पेंशन, छात्रवृत्ति और राशन योजनाओं के लिए अनिवार्य।',
    },
    issuingAuthority: {
      en: 'Samagra Social Security Mission (SSSM), Department of Social Justice & PwD, MP',
      hi: 'समग्र सामाजिक सुरक्षा मिशन, सामाजिक न्याय एवं दिव्यांगजन सशक्तिकरण विभाग, म.प्र.',
    },
    whereToObtain: {
      en: 'Check or print your Samagra ID card online at samagra.gov.in, or visit your local Gram Panchayat / Ward Office.',
      hi: 'samagra.gov.in पोर्टल पर जाकर अपना परिवार व सदस्य कार्ड ऑनलाइन देखें व प्रिंट करें, अथवा ग्राम पंचायत/वार्ड कार्यालय में संपर्क करें।',
    },
    importantChecks: [
      {
        title: {
          en: 'Family ID vs Member ID Difference',
          hi: 'परिवार आईडी (8 अंक) बनाम सदस्य आईडी (9 अंक)',
        },
        desc: {
          en: 'Family ID consists of 8 digits, while individual Member ID consists of 9 digits. Individual schemes require the 9-digit Member ID.',
          hi: 'परिवार आईडी 8 अंकों की और सदस्य आईडी 9 अंकों की होती है। व्यक्तिगत योजनाओं में 9 अंकों की सदस्य आईडी आवश्यक होती है।',
        },
      },
      {
        title: {
          en: 'Aadhaar e-KYC Verification',
          hi: 'आधार e-KYC अनिवार्य स्थिति',
        },
        desc: {
          en: 'Ensure your Samagra profile is e-KYC linked with your Aadhaar; benefits cannot be released without completed e-KYC.',
          hi: 'समग्र पोर्टल पर आधार e-KYC पूरा होना अनिवार्य है; बिना ई-केवाईसी किसी भी योजना की राशि स्वीकृत नहीं होती।',
        },
      },
      {
        title: {
          en: 'Bank Account Seeding',
          hi: 'बैंक खाता डीबीटी सक्रिय होना',
        },
        desc: {
          en: 'Your registered bank account must be active with DBT and Aadhaar seeding enabled.',
          hi: 'समग्र में दर्ज आपका बैंक खाता आधार से लिंक और प्रत्यक्ष लाभ अंतरण (DBT) के लिए सक्रिय होना चाहिए।',
        },
      },
    ],
    formatDisclaimer: {
      en: 'Samagra ID is unique to Madhya Pradesh. Other states have equivalent family registries (e.g., Parivar Pehchan Patra in Haryana, Kutumba in Karnataka).',
      hi: 'समग्र आईडी केवल मध्य प्रदेश में लागू है। अन्य राज्यों में इसके समकक्ष परिवार पहचान प्रणालियां (जैसे हरियाणा में PPP) उपलब्ध हैं।',
    },
  },

  [SUPPORTED_DOCUMENT_TYPES.DOMICILE_CERTIFICATE]: {
    type: SUPPORTED_DOCUMENT_TYPES.DOMICILE_CERTIFICATE,
    sampleImage: '/samples/domicile-certificate-sample.svg',
    name: {
      en: 'Domicile / Residence Certificate',
      hi: 'मूल निवास प्रमाण पत्र',
    },
    category: {
      en: 'State Residency Proof',
      hi: 'राज्य निवास प्रमाण',
    },
    purpose: {
      en: 'Proof that an applicant is a bona fide permanent resident of a specific state or Union Territory, crucial for state-specific quota and welfare schemes.',
      hi: 'प्रमाणित करता है कि नागरिक उस राज्य का स्थायी मूल निवासी है। राज्य स्तरीय योजनाओं व स्थानीय लाभों के लिए आवश्यक।',
    },
    issuingAuthority: {
      en: 'District Magistrate / Sub-Divisional Magistrate / Tehsildar of the respective district',
      hi: 'जिला मजिस्ट्रेट / अनुविभागीय अधिकारी / तहसीलदार कार्यालय',
    },
    whereToObtain: {
      en: 'Apply through your state e-District or citizen service portal, or physically at Tehsil Lok Seva Kendra.',
      hi: 'राज्य के ई-डिस्ट्रिक्ट पोर्टल अथवा तहसील लोक सेवा केंद्र में पते के प्रमाण व राशन कार्ड के साथ आवेदन करें।',
    },
    importantChecks: [
      {
        title: {
          en: 'Online Verification Serial Number',
          hi: 'ऑनलाइन सत्यापन क्रमांक',
        },
        desc: {
          en: 'Verify that the certificate contains an application or certificate registration number that can be searched on the government portal.',
          hi: 'प्रमाण पत्र में दर्ज रजिस्ट्रेशन नंबर सरकारी पोर्टल पर सर्च करने पर सत्यापित होना चाहिए।',
        },
      },
      {
        title: {
          en: 'Permanent Address Match',
          hi: 'स्थायी पते का मिलान',
        },
        desc: {
          en: 'The residential village, town, and tehsil mentioned should match your current identity records.',
          hi: 'प्रमाण पत्र में उल्लिखित गांव, शहर और तहसील आपके पहचान पत्रों से मेल खानी चाहिए।',
        },
      },
    ],
    formatDisclaimer: {
      en: 'Formats, titles (e.g., Bonafide Resident vs Domicile), and watermarks differ across states. Computerized e-District printouts with QR codes are universally valid.',
      hi: 'विभिन्न राज्यों में नाम (बोनाफाइड या मूल निवास) और प्रारूप अलग हो सकते हैं। क्यूआर कोड वाले डिजिटल प्रिंट पूरी तरह मान्य हैं।',
    },
  },

  [SUPPORTED_DOCUMENT_TYPES.RATION_CARD]: {
    type: SUPPORTED_DOCUMENT_TYPES.RATION_CARD,
    sampleImage: '/samples/ration-card-sample.svg',
    name: {
      en: 'Ration Card (NFSA / BPL / AAY)',
      hi: 'राशन कार्ड (राष्ट्रीय खाद्य सुरक्षा / बीपीएल)',
    },
    category: {
      en: 'Household Food Security & Entitlement',
      hi: 'पारिवारिक खाद्य सुरक्षा एवं पात्रता',
    },
    purpose: {
      en: 'Official document issued to households for subsidized food grains and serves as proof of family composition and socio-economic category (BPL/AAY/PHH).',
      hi: 'रियायती खाद्यान्न प्राप्त करने तथा परिवार के सदस्यों की संख्या व आर्थिक श्रेणी (BPL / अंत्योदय / PHH) प्रमाणित करने हेतु।',
    },
    issuingAuthority: {
      en: 'Department of Food, Civil Supplies and Consumer Affairs of the State Government',
      hi: 'राज्य खाद्य, नागरिक आपूर्ति एवं उपभोक्ता संरक्षण विभाग',
    },
    whereToObtain: {
      en: 'Apply through the state food and civil supplies portal or local Food Supply Office / Gram Panchayat.',
      hi: 'राज्य के खाद्य आपूर्ति पोर्टल अथवा क्षेत्रीय खाद्य नागरिक आपूर्ति कार्यालय / ग्राम पंचायत के माध्यम से आवेदन करें।',
    },
    importantChecks: [
      {
        title: {
          en: 'Applicant Name Listed in Family Units',
          hi: 'परिवार के सदस्यों में आवेदक का नाम',
        },
        desc: {
          en: 'Check that the applicant’s name is clearly listed under the family member units on the card.',
          hi: 'सुनिश्चित करें कि राशन कार्ड में दर्ज सदस्यों की सूची में आवेदक का नाम स्पष्ट रूप से जुड़ा हो।',
        },
      },
      {
        title: {
          en: 'Card Category (BPL / Antyodaya / Priority)',
          hi: 'राशन कार्ड की श्रेणी (BPL / अंत्योदय / प्राथमिकता)',
        },
        desc: {
          en: 'Verify whether the scheme requires an Antyodaya (AAY), BPL, or Priority Household (PHH) card type.',
          hi: 'जांचें कि योजना में अंत्योदय, बीपीएल या प्राथमिकता परिवार (PHH) में से किस श्रेणी के कार्ड की मांग की गई है।',
        },
      },
      {
        title: {
          en: 'Aadhaar Seeding for All Members',
          hi: 'सभी सदस्यों का आधार सीडिंग',
        },
        desc: {
          en: 'Under One Nation One Ration Card, members must have their Aadhaar seeded to remain active.',
          hi: 'वन नेशन वन राशन कार्ड के तहत राशन कार्ड में दर्ज सभी सदस्यों का आधार लिंक होना आवश्यक है।',
        },
      },
    ],
    formatDisclaimer: {
      en: 'Ration cards vary widely in color and format (e.g., Yellow, Blue, White, or e-Ration slip). Digital RC prints downloaded from DigiLocker or NFSA portal are accepted.',
      hi: 'राशन कार्ड का रंग व प्रारूप (पीला, नीला, सफेद या ई-राशन पर्ची) राज्य अनुसार अलग होता है। डिजिलॉकर व NFSA से डाउनलोड ई-राशन कार्ड भी मान्य हैं।',
    },
  },

  [SUPPORTED_DOCUMENT_TYPES.BANK_PASSBOOK]: {
    type: SUPPORTED_DOCUMENT_TYPES.BANK_PASSBOOK,
    sampleImage: '/samples/bank-passbook-sample.svg',
    name: {
      en: 'Bank Passbook / Account Proof',
      hi: 'बैंक पासबुक / खाता विवरण',
    },
    category: {
      en: 'Financial & DBT Disbursement Account',
      hi: 'वित्तीय एवं डीबीटी भुगतान खाता',
    },
    purpose: {
      en: 'Used to verify account number, bank branch IFSC code, and DBT linkage for direct cash transfer of welfare scheme benefits into the beneficiary’s account.',
      hi: 'खाता संख्या, IFSC कोड और डीबीटी सक्रियता की पुष्टि के लिए जिससे योजना की राशि सीधे लाभार्थी के खाते में भेजी जा सके।',
    },
    issuingAuthority: {
      en: 'Scheduled Commercial Bank, Regional Rural Bank (RRB), or India Post Payments Bank',
      hi: 'अनुसूचित वाणिज्यिक बैंक, क्षेत्रीय ग्रामीण बैंक (RRB), अथवा इंडिया पोस्ट पेमेंट्स बैंक',
    },
    whereToObtain: {
      en: 'Obtain from your local bank branch upon opening a savings bank account (or download a verified e-statement with seal).',
      hi: 'अपनी बैंक शाखा में बचत खाता खोलकर पासबुक प्राप्त करें, अथवा बैंक से मुहरयुक्त ई-स्टेटमेंट लें।',
    },
    importantChecks: [
      {
        title: {
          en: 'Aadhaar NPCI / DBT Mapping',
          hi: 'आधार एनपीसीआई / डीबीटी मैपिंग',
        },
        desc: {
          en: 'Government benefits cannot reach accounts without active Aadhaar-DBT seeding on the NPCI mapper.',
          hi: 'यदि बैंक खाता NPCI मैपर पर आधार से DBT सक्रिय नहीं है, तो सरकारी सहायता का पैसा खाते में नहीं आ पाएगा।',
        },
      },
      {
        title: {
          en: 'Legible Account Number & IFSC',
          hi: 'स्पष्ट खाता संख्या और IFSC कोड',
        },
        desc: {
          en: 'The first page must clearly display your full name, 11-digit or 16-digit account number, and 11-character IFSC code.',
          hi: 'पासबुक के मुख्य पृष्ठ पर आपका पूरा नाम, खाता संख्या और 11 अंकों का IFSC कोड बिल्कुल साफ दिखना चाहिए।',
        },
      },
      {
        title: {
          en: 'Single vs Joint Account Rules',
          hi: 'एकल (Single) खाता नियम',
        },
        desc: {
          en: 'Most individual schemes (e.g., Ladli Behna, PM-Kisan) mandate an individual account held solely in the applicant’s name.',
          hi: 'लाड़ली बहना या पीएम-किसान जैसी अधिकांश व्यक्तिगत योजनाओं में आवेदक के नाम पर एकल (Single) खाता होना आवश्यक है।',
        },
      },
    ],
    formatDisclaimer: {
      en: 'Passbook designs vary by bank. A canceled cheque or bank statement with official seal/signature is usually accepted in place of a physical passbook.',
      hi: 'प्रत्येक बैंक की पासबुक का प्रारूप अलग होता है। भौतिक पासबुक के स्थान पर निरस्त चेक (Cancelled Cheque) या बैंक मुहरयुक्त विवरण भी स्वीकार्य है।',
    },
  },

  [SUPPORTED_DOCUMENT_TYPES.MARKSHEET]: {
    type: SUPPORTED_DOCUMENT_TYPES.MARKSHEET,
    sampleImage: '/samples/marksheet-sample.jpg',
    name: {
      en: 'Class VII / VIII Marksheet',
      hi: 'कक्षा 7वीं / 8वीं अंकसूची सह प्रमाण-पत्र',
    },
    category: {
      en: 'Educational Qualification & Merit Proof',
      hi: 'शैक्षणिक योग्यता एवं प्राप्तांक प्रमाण',
    },
    purpose: {
      en: 'Verifies academic qualification, passing year, subject scores, and minimum percentage criteria required for merit scholarships and educational welfare schemes.',
      hi: 'शैक्षणिक योग्यता, उत्तीर्ण वर्ष, विषयवार प्राप्तांक और छात्रवृत्ति योजनाओं के लिए निर्धारित न्यूनतम प्रतिशत की पुष्टि हेतु।',
    },
    issuingAuthority: {
      en: 'School Headmaster / Recognized State or Central Education Board',
      hi: 'संबंधित विद्यालय / मान्यता प्राप्त राज्य अथवा केंद्रीय शिक्षा बोर्ड',
    },
    whereToObtain: {
      en: 'Obtain from your school administration or download verified digital copy from DigiLocker / State Education Board portal.',
      hi: 'अपने विद्यालय कार्यालय से प्राप्त करें अथवा डिजिलॉकर / संबंधित शिक्षा बोर्ड पोर्टल से डिजिटल प्रति डाउनलोड करें।',
    },
    importantChecks: [
      {
        title: {
          en: 'Minimum Percentage Criteria',
          hi: 'न्यूनतम प्रतिशत अहर्ता',
        },
        desc: {
          en: 'Ensure your aggregate marks meet the scheme threshold (e.g., minimum 55% marks for General/OBC, 50% for SC/ST).',
          hi: 'सुनिश्चित करें कि कुल प्राप्तांक योजना की न्यूनतम सीमा (सामान्य/ओबीसी 55%, एससी/एसटी 50%) के अनुरूप हों।',
        },
      },
      {
        title: {
          en: 'Student & Parents Name Match',
          hi: 'छात्र व माता-पिता के नाम का मिलान',
        },
        desc: {
          en: 'Student name, date of birth, and parents names must match your Aadhaar card and bank account records exactly.',
          hi: 'छात्र का नाम, जन्म तिथि व माता-पिता का नाम आधार कार्ड व बैंक विवरण से अक्षरशः मेल खाना चाहिए।',
        },
      },
      {
        title: {
          en: 'School Seal or Board Verification',
          hi: 'विद्यालय की मुहर अथवा बोर्ड सत्यापन',
        },
        desc: {
          en: 'Physical marksheet must bear school principal seal and signature, or have a verifiable DigiLocker digital signature.',
          hi: 'भौतिक अंकसूची पर संस्था प्राचार्य के हस्ताक्षर व मुहर अथवा डिजिलॉकर डिजिटल सत्यापन होना अनिवार्य है।',
        },
      },
    ],
    formatDisclaimer: {
      en: 'Marksheet layouts differ across state secondary education boards, ICSE, and CBSE. DigiLocker verified digital marksheets are officially recognized everywhere.',
      hi: 'विभिन्न शिक्षा बोर्डों के अंकसूची प्रारूप अलग हो सकते हैं। डिजिलॉकर सत्यापित डिजिटल अंकसूची सभी जगह आधिकारिक रूप से मान्य है।',
    },
  },
};

/**
 * Strict mapping of known document IDs to the 7 supported document types.
 * Any document not mapped here and not meeting strict criteria will resolve to null.
 */
const EXACT_ID_MAP = {
  // 1. Aadhaar Card (Standard Aadhaar only; Biometric-specific authentication docs excluded)
  'doc-aadhaar': SUPPORTED_DOCUMENT_TYPES.AADHAAR_CARD,
  'doc-aadhaar-woman': SUPPORTED_DOCUMENT_TYPES.AADHAAR_CARD,
  'doc-aadhaar-family': SUPPORTED_DOCUMENT_TYPES.AADHAAR_CARD,
  'doc-aadhaar-mp': SUPPORTED_DOCUMENT_TYPES.AADHAAR_CARD,
  'doc-aadhaar-pmjay': SUPPORTED_DOCUMENT_TYPES.AADHAAR_CARD,
  'doc-aadhaar-svanidhi': SUPPORTED_DOCUMENT_TYPES.AADHAAR_CARD,
  'doc-age-proof': SUPPORTED_DOCUMENT_TYPES.AADHAAR_CARD,
  'aadhaar-card': SUPPORTED_DOCUMENT_TYPES.AADHAAR_CARD,

  // 2. Income Certificate
  'doc-income-certificate': SUPPORTED_DOCUMENT_TYPES.INCOME_CERTIFICATE,
  'income-certificate': SUPPORTED_DOCUMENT_TYPES.INCOME_CERTIFICATE,

  // 3. Caste Certificate
  'doc-caste-certificate': SUPPORTED_DOCUMENT_TYPES.CASTE_CERTIFICATE,
  'doc-caste': SUPPORTED_DOCUMENT_TYPES.CASTE_CERTIFICATE,
  'caste-certificate': SUPPORTED_DOCUMENT_TYPES.CASTE_CERTIFICATE,

  // 4. Samagra ID (Madhya Pradesh)
  'doc-samagra': SUPPORTED_DOCUMENT_TYPES.SAMAGRA_ID,
  'doc-samagra-id': SUPPORTED_DOCUMENT_TYPES.SAMAGRA_ID,
  'samagra-id': SUPPORTED_DOCUMENT_TYPES.SAMAGRA_ID,

  // 5. Domicile Certificate
  'doc-domicile-certificate': SUPPORTED_DOCUMENT_TYPES.DOMICILE_CERTIFICATE,
  'doc-domicile': SUPPORTED_DOCUMENT_TYPES.DOMICILE_CERTIFICATE,
  'domicile-certificate': SUPPORTED_DOCUMENT_TYPES.DOMICILE_CERTIFICATE,

  // 6. Ration Card
  'doc-ration-card-pmjay': SUPPORTED_DOCUMENT_TYPES.RATION_CARD,
  'doc-bpl-card': SUPPORTED_DOCUMENT_TYPES.RATION_CARD,
  'ration-card': SUPPORTED_DOCUMENT_TYPES.RATION_CARD,

  // 7. Bank Passbook (Standard Passbooks only; Aadhaar-seeded / DBT-active / Student / Jan Dhan accounts excluded from View Sample)
  'doc-bank-passbook': SUPPORTED_DOCUMENT_TYPES.BANK_PASSBOOK,
  'doc-bank-account-artisan': SUPPORTED_DOCUMENT_TYPES.BANK_PASSBOOK,
  'doc-bank-account-pmay': SUPPORTED_DOCUMENT_TYPES.BANK_PASSBOOK,
  'doc-bank-account-svanidhi': SUPPORTED_DOCUMENT_TYPES.BANK_PASSBOOK,
  'doc-dbt-bank-mp': SUPPORTED_DOCUMENT_TYPES.BANK_PASSBOOK,
  'bank-passbook': SUPPORTED_DOCUMENT_TYPES.BANK_PASSBOOK,

  // 8. Educational Marksheet
  'doc-marksheet-7th-8th': SUPPORTED_DOCUMENT_TYPES.MARKSHEET,
  'marksheet': SUPPORTED_DOCUMENT_TYPES.MARKSHEET,
};

/**
 * Resolves a document object to one of the 7 supported document type identifiers.
 * Returns null if the document cannot be confidently matched to one of the seven types.
 *
 * @param {Object} doc - Document object with id, title, etc.
 * @returns {string|null} One of SUPPORTED_DOCUMENT_TYPES or null
 */
export function resolveDocumentType(doc) {
  if (!doc) return null;

  const docId = (doc.id || '').trim();
  const titleEn = (doc.title?.en || (typeof doc.title === 'string' ? doc.title : '')).toLowerCase().trim();
  const titleHi = (doc.title?.hi || '').toLowerCase().trim();
  const combined = `${docId.toLowerCase()} ${titleEn} ${titleHi}`;

  // Explicit exclusions: "Aadhaar-Seeded Bank Passbook", "Bank Account Passbook (DBT Active)",
  // "Aadhaar Card (Biometric)", "Ration Card / Family Composition Certificate",
  // "Bank Account Passbook (Jan Dhan or Savings)", and "Student's Own Aadhaar-Linked Bank Account"
  // must NOT show a View Sample / photo preview option
  if (
    docId === 'doc-bank' ||
    docId === 'doc-bank-pmay' ||
    docId === 'doc-bank-ind' ||
    docId === 'doc-bank-student' ||
    docId === 'doc-aadhaar-vk' ||
    docId === 'doc-aadhaar-artisan' ||
    docId === 'doc-ration-card' ||
    docId === 'doc-bank-account' ||
    combined.includes('student') ||
    combined.includes('विद्यार्थी') ||
    combined.includes('छात्र') ||
    combined.includes('family composition') ||
    combined.includes('परिवार संरचना') ||
    combined.includes('jan dhan') ||
    combined.includes('जन धन') ||
    combined.includes('biometric') ||
    combined.includes('बायोमेट्रिक') ||
    combined.includes('aadhaar-seeded') ||
    combined.includes('aadhaar seeded') ||
    combined.includes('aadhaar seeding') ||
    combined.includes('आधार-सीडेड') ||
    combined.includes('आधार सीडेड') ||
    combined.includes('aadhaar-linked') ||
    combined.includes('aadhaar linked') ||
    combined.includes('आधार-लिंक') ||
    combined.includes('आधार लिंक') ||
    combined.includes('dbt active') ||
    combined.includes('dbt-active') ||
    combined.includes('dbt enabled') ||
    combined.includes('डीबीटी सक्रिय')
  ) {
    return null;
  }

  // If document already has an explicit valid type
  if (doc.type && Object.values(SUPPORTED_DOCUMENT_TYPES).includes(doc.type)) {
    return doc.type;
  }
  if (doc.document_type && Object.values(SUPPORTED_DOCUMENT_TYPES).includes(doc.document_type)) {
    return doc.document_type;
  }

  // 1. Exact ID mapping takes precedence
  if (EXACT_ID_MAP[docId]) {
    return EXACT_ID_MAP[docId];
  }

  // Strict Exclusions: Documents that MUST NEVER receive a sample button
  const unsupportedKeywords = [
    'mobile',
    'phone',
    'मोबाइल',
    'फोन',
    'land',
    'khasra',
    'khatauni',
    'khatoni',
    'ror',
    'भूलेख',
    'खसरा',
    'खतौनी',
    'जमाबंदी',
    'job card',
    'mgnrega',
    'मनरेगा',
    'vendor',
    'vending',
    'विक्रेता',
    'pan card',
    'voter',
    'मतदाता',
    'disability',
    'divyang',
    'दिव्यांग',
    'birth certificate',
    'जन्म प्रमाण',
  ];

  for (const kw of unsupportedKeywords) {
    if (combined.includes(kw)) {
      return null;
    }
  }

  // CRITICAL ORDER RULE: Bank Passbooks often mention "Aadhaar-Seeded" or "Aadhaar & NPCI".
  // Therefore, check Bank Passbook BEFORE Aadhaar Card so "Aadhaar-Seeded Bank Passbook"
  // always correctly resolves to BANK_PASSBOOK and NEVER to AADHAAR_CARD!
  const isBankDoc =
    combined.includes('passbook') ||
    combined.includes('पासबुक') ||
    combined.includes('bank account') ||
    combined.includes('बैंक खाता') ||
    combined.includes('bank details') ||
    combined.includes('savings account') ||
    combined.includes('बचत खाता');

  if (isBankDoc) {
    return SUPPORTED_DOCUMENT_TYPES.BANK_PASSBOOK;
  }

  // Check Aadhaar Card: MUST strictly be an Aadhaar Card / Number or Age Proof using Aadhaar
  const isAadhaarDoc =
    combined.includes('aadhaar card') ||
    combined.includes('आधार कार्ड') ||
    combined.includes('aadhaar number') ||
    combined.includes('आधार नंबर') ||
    (combined.includes('aadhaar') && (combined.includes('age proof') || combined.includes('आयु प्रमाण'))) ||
    (combined.startsWith('doc-aadhaar') && !combined.includes('mobile'));

  if (isAadhaarDoc) {
    return SUPPORTED_DOCUMENT_TYPES.AADHAAR_CARD;
  }

  // Check Income Certificate
  if (combined.includes('income certificate') || combined.includes('आय प्रमाण')) {
    return SUPPORTED_DOCUMENT_TYPES.INCOME_CERTIFICATE;
  }

  // Check Caste Certificate
  if (
    combined.includes('caste certificate') ||
    combined.includes('जाति प्रमाण') ||
    combined.includes('community certificate')
  ) {
    return SUPPORTED_DOCUMENT_TYPES.CASTE_CERTIFICATE;
  }

  // Check Samagra ID (Madhya Pradesh)
  if (combined.includes('samagra') || combined.includes('समग्र')) {
    return SUPPORTED_DOCUMENT_TYPES.SAMAGRA_ID;
  }

  // Check Domicile Certificate
  if (
    combined.includes('domicile') ||
    combined.includes('निवास प्रमाण') ||
    combined.includes('मूल निवास') ||
    combined.includes('residence certificate')
  ) {
    return SUPPORTED_DOCUMENT_TYPES.DOMICILE_CERTIFICATE;
  }

  // Check Ration Card
  if (
    combined.includes('ration card') ||
    combined.includes('राशन कार्ड') ||
    combined.includes('bpl card') ||
    combined.includes('बीपीएल कार्ड') ||
    combined.includes('ration')
  ) {
    return SUPPORTED_DOCUMENT_TYPES.RATION_CARD;
  }

  // Check Educational Marksheet
  if (
    combined.includes('marksheet') ||
    combined.includes('अंकसूची') ||
    combined.includes('मार्कशीट') ||
    combined.includes('marks statement')
  ) {
    return SUPPORTED_DOCUMENT_TYPES.MARKSHEET;
  }

  // Any other document is unsupported
  return null;
}

/**
 * Returns sample specimen metadata for a given document.
 * Returns null if the document does not strictly belong to the 7 supported document types.
 *
 * @param {Object} doc - Document object
 * @returns {Object|null} Matching sample metadata or null
 */
export function getDocumentSample(doc) {
  const docType = resolveDocumentType(doc);
  if (!docType || !DOCUMENT_SAMPLE_REGISTRY[docType]) {
    return null;
  }
  return DOCUMENT_SAMPLE_REGISTRY[docType];
}
