# Scam Playbook: Phone/Video-Call Fraud Taxonomy, Utterance Corpus, Benign Controls, Persuasion Model and Demo Transcripts

Compiled 2026-09-15 from public advisories (I4C / cybercrime.gov.in, TRAI, RBI, CERT-In, Sanchar Saathi, FTC, FBI IC3, FCC, US Courts, SSA OIG, AARP, Action Fraud UK, Which?, Scamwatch / ACCC, ATO, ACMA), news reconstructions of victim calls (Deccan Herald, Tribune, Gulf News, National Herald, The420, SCMP/Trend Micro on the Arup case), scam-baiter transcripts (Zeltser, TechSupportScam.com, Scamnetic), and academic work (Stajano & Wilson 2011; Cialdini). Utterances are paraphrased/synthesised from those descriptions and from recurring phrasing in reported cases; they are not verbatim quotes of any single victim call.

**Format conventions used throughout**

- Utterance lines: `- "utterance" | tags: tag1, tag2 | sev: N`
- Tags are drawn only from: `authority, urgency, fear, secrecy, isolation, payment_method, otp_request, remote_access, verification_bypass, too_good, reciprocity, personal_info, social_proof, escalation, hold_the_line, video_call_demand, legal_threat, account_compromise_pretext, relationship_pretext, tech_pretext`
- Severity: 1 = pretext/hook only (ambiguous on its own) · 2 = pressure without an ask · 3 = control tactic (secrecy, hold-the-line, isolation, verification bypass) · 4 = extraction of sensitive data or setup for payment · 5 = direct irreversible ask (OTP, PIN, remote access, transfer, gift card, crypto, cash hand-over)
- Family IDs: `IN-` India-centric, `US-`, `UK-`, `AU-`, `G-` global.

---

## 1. Taxonomy of phone/video-call scam families

### 1.1 The universal script arc

Nearly every family below runs the same seven-stage arc; families differ in which stages they emphasise and in the pretext vocabulary.

| Stage | Purpose | Typical signals |
|---|---|---|
| 1. Hook | Get the target to engage / call back / press 1 | IVR "press 9", "parcel intercepted", "your number will be blocked", "Hi Mum, new number", "Grandma?" |
| 2. Authority / pretext | Establish who they are and why they're calling | Badge/officer names, FIR/case numbers, employee IDs, spoofed caller ID, uniforms on video, "this call is recorded" |
| 3. Fear / urgency | Collapse the decision window | "within 2 hours", "warrant", "account will be frozen tonight", "the judge is waiting" |
| 4. Isolation / secrecy | Prevent consultation | "national security, tell no one", "don't disconnect", "your family may be involved", "keep the camera on" |
| 5. Verification bypass | Pre-empt the target's own checks | "the branch staff are under investigation", "if you Google it, the hacker will see", "I'll give you a call-back number" (theirs), "we'll verify on Skype" |
| 6. Payment / OTP / access extraction | The actual theft | "read the code", "move money to the RBI safe account", "buy gift cards", "install AnyDesk", "pay bail via Bitcoin ATM" |
| 7. Escalation / retention | Extract more, keep victim compliant | "another case surfaced", "tax on your refund", "unlock fee", "one more verification", "you're in this now", threats when victim hesitates |

### 1.2 Family index

| ID | Family | Region | One-line description | Arc emphasis |
|---|---|---|---|---|
| IN-01 | Digital arrest | IN | Impersonated CBI/ED/Customs/NCB/TRAI/Mumbai Police/RBI/Supreme Court officers "arrest" the victim over video, alleging a drug parcel, money laundering with their Aadhaar, or a Naresh Goyal/Jet Airways-style case; victim is held on camera for hours to days and told to move savings to a "safe/RBI verification account". | Authority + isolation + hold-the-line → safe account |
| IN-02 | Courier / FedEx / DHL / Blue Dart parcel | IN (also US/UK) | "Your parcel to Taiwan/Beijing was seized with MDMA, passports, credit cards." IVR → "customer care" → transfer to "Mumbai cyber crime". Feeder scam for IN-01. | Hook → authority → transfer |
| IN-03 | TRAI / DoT SIM disconnection | IN | "Your mobile number will be disconnected in 2 hours; press 9." Another SIM in your name is sending obscene/harassing messages; you need a police "no objection". Feeder for IN-01. | Hook + urgency → authority |
| IN-04 | Bank KYC / account block / OTP | IN | "Your KYC has expired / PAN not linked; account will be blocked today. Share OTP / install app / click link to update." Also SBI YONO, HDFC, PNB, Paytm variants. | Urgency → OTP |
| IN-05 | Credit card fraud dept / limit / reward points | IN, global | "Fraud transaction of ₹49,999 on your card; to block it read the OTP." Or "your reward points worth ₹8,450 are expiring." | Account compromise → OTP |
| IN-06 | Electricity bill disconnection | IN | SMS "power will be disconnected tonight at 9:30 PM, contact electricity officer" → "junior engineer" demands ₹10 "update fee" via link/APK/UPI. | Urgency → remote access / UPI |
| IN-07 | Income-tax refund | IN | "Refund of ₹15,490 approved; verify bank account/click link/pay processing fee." Also "IT notice, pay penalty or face prosecution". | Too-good or fear → personal_info/payment |
| IN-08 | Lottery / prize / KBC / Jio lucky draw | IN | "You have won ₹25 lakh in KBC / Jio lucky draw; pay GST/processing fee to release." Often WhatsApp voice from +92/Pakistan numbers. | Too-good → reciprocity → fee |
| IN-09 | Loan app harassment / recovery extortion | IN | Predatory Chinese-linked instant-loan apps and fake "recovery agents" threaten borrowers (or non-borrowers) with morphed nude photos sent to contacts, FIRs, and visits. | Fear + legal threat + social shaming → payment |
| IN-10 | Job / task scam (YouTube likes, Telegram, prepaid tasks) | IN (global) | Part-time "like and subscribe" work pays small real amounts, then "prepaid/merchant tasks" require deposits; dashboard shows fake profits; "unlock fee" to withdraw. | Reciprocity + social proof → deposits → escalation |
| IN-11 | Investment / stock-tip / crypto WhatsApp groups (pig butchering) | IN (global) | Added to "VIP trading group" run by a "SEBI-registered" analyst / fake Motilal Oswal or Goldman app; fake IPO allotments; screenshots of members' profits; fake app shows gains; withdrawal blocked pending "tax". | Social proof + too-good → deposits → escalation |
| IN-12 | UPI / cashback / QR code / collect request | IN | "Scan this QR to receive ₹5,000 refund", "accept the collect request", "enter your UPI PIN to receive". Also OLX buyer variant. | Too-good → verification bypass → PIN |
| IN-13 | Amazon / Flipkart order fraud / delivery OTP | IN, global | "Your order for iPhone 15 worth ₹79,900 has been placed; press 1 if not you." "Delivery partner needs OTP to cancel." Also "Amazon Prime auto-renew ₹1,499". | Account compromise → OTP/remote |
| IN-14 | Insurance / policy-maturity / IRDAI | IN | "Your LIC policy bonus of ₹4.2 lakh is stuck; pay GST/NOC/processing charge to IRDAI account." Also fake "policy revival" and "agent commission refund". | Too-good + authority → fees |
| IN-15 | Government scheme / subsidy | IN | "PM Kisan / Ayushman / scholarship / gas subsidy / PM Awas amount pending; update Aadhaar-linked account, share OTP or install app." | Authority + too-good → OTP/APK |
| IN-16 | Army-man / CSD OLX-Quikr scam | IN | Seller/buyer poses as Army/CRPF/BSF jawan posted at airport/cantonment; shares Aadhaar/CSD card; asks advance via Paytm "for Army courier"; buyer variant sends QR "to pay you". | Trust/pretext → reciprocity → advance payment |
| IN-17 | Fake customer-care numbers (Google/JustDial planted) | IN | Victim Googles "Swiggy/IndiGo/SBI customer care", calls a planted number; "agent" resolves the complaint by asking for card details, OTP, UPI PIN or AnyDesk. | Tech pretext → remote/OTP (victim-initiated!) |
| G-01 | Tech support (Microsoft / Apple / Amazon / Norton / Geek Squad) | Global | Pop-up or cold call: "Your computer is sending error messages / has been hacked; let me connect and fix it." Charges for fake fix or pivots to bank "protection". | Tech pretext → remote access → payment |
| G-02 | Tech-support refund / overpayment | Global | "We are closing / you are owed a $299 refund." Remote session, victim types amount, scammer adds zeros to fake bank page, "you must return the $29,700 excess" via gift cards / cash / crypto. | Reciprocity → remote → guilt → payment |
| G-03 | Grandparent / family emergency (voice clone) | US/CA/AU/UK/IN | "Grandma, it's me, I've been in an accident / arrested, don't tell Mom." Hands to "lawyer/bail officer"; cash by courier, gift cards, crypto. AI voice-clones now common. | Relationship + fear + secrecy → cash |
| G-04 | Romance | Global | Long-con relationship (dating app, Instagram, wrong-number), then medical/customs/travel/investment money asks; frequently merges into G-11 investment. | Relationship → reciprocity → escalation |
| G-05 | Sextortion | Global | After video-call nudity (often pre-recorded on the other side) or claiming webcam hack: "Pay or I send this to your contacts/YouTube." Also "cyber cell officer" follow-up call demanding a "deletion fee". | Fear + shame + urgency → payment |
| G-06 | Deepfake CEO / CFO / BEC wire fraud | Global | Deepfaked executive on video/voice (Arup, HK 2024: US$25.6M) instructs finance staff to make confidential transfers for an acquisition/settlement; "don't loop in anyone else". | Authority + secrecy + urgency → wire |
| US-01 | Jury duty / failure to appear | US | "Deputy" says a warrant was issued for missing jury duty; pay a "bond" by prepaid card / Zelle / Bitcoin ATM to avoid arrest; "stay on the line, go to your car". | Legal threat + hold-the-line → payment |
| US-02 | Social Security (SSA) | US | "Your SSN has been suspended for suspicious activity in Texas; a car found at the border with your SSN; warrant." Move money to "protect it" / gift cards. | Legal threat → safe account/gift cards |
| US-03 | IRS / tax | US | "Final notice: you owe back taxes; police are on the way unless you pay via iTunes/Google Play/EFTPS 'voucher'." | Legal threat → payment |
| US-04 | Medicare | US | "New plastic/chip Medicare card, free genetic test/back brace. confirm your Medicare number." Identity theft + billing fraud. | Authority + too-good → personal_info |
| US-05 | Utility shutoff | US | "Your power will be disconnected in 30 minutes for non-payment; pay now via prepaid card / Zelle." Targets restaurants and small businesses at rush hour. | Urgency → payment |
| G-07 | Amazon / Apple / PayPal impostor (US flavour) | US/UK/AU | "Suspicious $1,299 MacBook order on your Amazon; press 1." Pivots into remote access and "your identity is compromised, transfer funds to a federal account". | Account compromise → remote → safe account |
| UK-01 | Bank impersonation / "safe account" / courier fraud | UK (also IE/AU) | "Fraud team" or "police" say staff at your branch are corrupt / your account is compromised; move money to a "safe account" or hand cash/cards/gold to a courier; "don't tell the branch what it's for". | Authority + secrecy → safe account |
| UK/AU-01 | "Hi Mum / Hi Dad" | UK/AU/CA/IE | WhatsApp/SMS from "child" with new number: "phone broken, locked out of banking, need to pay a bill today, can you transfer?" | Relationship → urgency → transfer |
| AU-01 | ATO / tax-debt | AU | "Outstanding tax debt; arrest warrant; pay via gift cards/Bitcoin/bank transfer; stay on the line." Robocall hook. | Legal threat + hold-the-line → payment |
| G-08 | Fake police / cyber-cell follow-up ("recovery" scam) | Global | Calls previous victims: "We recovered your money; pay a release fee / share details." FTC-impersonator variant sends fake ID badges. | Authority + reciprocity → fee |

---

## 2. Per-family script arc and utterance corpus

### IN-01 Digital arrest

**Description.** Victim (often retirees, doctors, IT professionals, homemakers) is told a parcel/bank account/SIM in their name is linked to drugs, terror funding or money laundering. Call moves to Skype/WhatsApp video; "officers" appear in uniform with police station backdrop and fake letterheads (CBI, ED, Supreme Court, RBI, "Mumbai Cyber Crime Branch"), issue "arrest warrants", and keep the victim on camera continuously. sometimes for days ("digital custody"). Money is moved in tranches to "RBI-verified safe accounts" for "verification and return within 24/48 hours". Losses: ₹34 lakh to ₹31.8 crore in individual cases.

**Script arc.** Hook (IN-02/IN-03 IVR, or direct "this is Mumbai Police") → transfer to "senior officer" / video → case number, warrant PDF, "your Aadhaar was used in Canara Bank Mumbai account, 6.8 crore laundered" → "national security, Section 20 secrecy, don't tell family" → "stay on video 24×7, report for every movement" → "verify your funds. transfer 100% to RBI account, will be refunded with certificate" → new cases/"court fee"/"bail bond" until victim is drained.

- "Sir, I am speaking from Mumbai Crime Branch, Andheri East. A case has been registered against your Aadhaar number under money laundering. Aap ka naam FIR mein hai." | tags: authority, legal_threat, account_compromise_pretext | sev: 3
- "Your Aadhaar has been used to open an account in Canara Bank, Mumbai branch, and 6 crore 80 lakh rupees of hawala money has been transacted through it." | tags: authority, account_compromise_pretext, fear | sev: 3
- "This is a matter of national security. You are not to discuss this case with anyone. not your wife, not your children, not your bank. Section 20 of the Official Secrets Act applies." | tags: secrecy, isolation, authority, legal_threat | sev: 4
- "I am transferring this call to DCP Sahab of the CBI. Please download Skype and search for 'Mumbai Cyber Cell Official'. Keep the video on." | tags: video_call_demand, authority, escalation | sev: 4
- "You are now under digital arrest. Do not disconnect the call, do not switch off the camera, do not leave the room. Every hour you will report to me." | tags: hold_the_line, isolation, legal_threat, authority | sev: 5
- "Naresh Goyal ke case mein aapka naam aaya hai. Supreme Court ne aapke against non-bailable warrant issue kiya hai. main abhi PDF bhej raha hoon." | tags: authority, legal_threat, fear | sev: 4
- "If you are innocent, cooperate. For verification you have to transfer 100 percent of your savings into the RBI verification account. After the audit, the money will be returned with a clearance certificate in 24 hours." | tags: payment_method, verification_bypass, authority, urgency | sev: 5
- "Madam, if you try to call the police station or visit the bank, the money-laundering gang will be alerted. they have people inside the bank. Only this channel is safe." | tags: verification_bypass, isolation, fear | sev: 4
- "Break your fixed deposits and mutual funds today. Tell the bank manager it is for a property purchase. do not mention this investigation." | tags: payment_method, secrecy, verification_bypass | sev: 5
- "Ma'am, I have your mobile location in front of me. If the video call is cut, the local police will reach your house within 10 minutes with the arrest warrant." | tags: fear, hold_the_line, legal_threat | sev: 4
- "Aapke account mein jo bhi paisa hai, uska source verify hoga. Court-approved secure account number main bhej raha hoon, RTGS kar dijiye." | tags: payment_method, authority | sev: 5
- "One more case has come up. a second account in Hyderabad. The Enforcement Directorate now needs an additional 12 lakh as surety bond, otherwise the interim bail is cancelled." | tags: escalation, legal_threat, payment_method | sev: 5
- "Your son's name is also appearing in the transaction list. If you want to keep him out of this, you must complete the verification quietly." | tags: fear, secrecy, relationship_pretext, escalation | sev: 4
- "I am recording this statement. Say 'I, [name], am cooperating with the CBI investigation voluntarily.' Now show me your bank app balance on camera." | tags: authority, personal_info, video_call_demand | sev: 4
- "Madam, this is a very confidential process. Aapko koi pooche toh bolna office ka kaam hai. Phone silent par rakho aur meri call par hi raho." | tags: secrecy, isolation, hold_the_line | sev: 4

### IN-02 Courier / FedEx / DHL / Blue Dart parcel

**Description.** Feeder stage for digital arrest. Automated call or "customer care" says a package booked in the victim's name (from Mumbai/Delhi to Taiwan, Beijing, Thailand) was seized by Customs containing MDMA, passports, laptops, credit cards. "Would you like to register a complaint with the cyber crime branch?" → transferred.

**Script arc.** IVR/press 1 → "FedEx compliance" recites parcel details and victim's Aadhaar/PAN → offers to "connect you to Mumbai Police to file complaint" → IN-01.

- "This call is from FedEx. A parcel booked in your name from Mumbai to Taiwan has been held by Customs. Press 1 to speak to our executive." | tags: authority, account_compromise_pretext | sev: 2
- "Sir, the parcel contains 5 expired passports, 3 credit cards, 4 kilograms of clothes, one laptop and 140 grams of MDMA. It was booked on 12th September using your Aadhaar number ending 4471." | tags: authority, fear, account_compromise_pretext, personal_info | sev: 3
- "Aapka naam, address aur mobile number consignor mein diya gaya hai. Customs ne parcel seize kar liya hai aur ek narcotics case register hua hai." | tags: authority, legal_threat, fear | sev: 3
- "If you did not send this parcel, your identity has been misused. I can connect you to the Andheri cyber crime police right now so a complaint gets registered in your name. Otherwise the case proceeds against you." | tags: authority, urgency, escalation, verification_bypass | sev: 3
- "Please stay on the line, I am conferencing Inspector Vijay Kumar of Mumbai Narcotics Control Bureau. Do not hang up or the complaint will lapse." | tags: hold_the_line, authority, urgency | sev: 3
- "The tracking ID is FX-2291-MU-TW. Our compliance team has already shared your details with the Narcotics department; you have to clear your name within the next 2 hours." | tags: urgency, fear, authority | sev: 3
- "Hello, DHL customer service here. Your shipment has been flagged for illegal contents. A fine of ₹18,000 is payable to release it, or the matter goes to the police." | tags: payment_method, legal_threat, fear | sev: 4
- "Sir, this is not a marketing call. The parcel has your PAN card photocopy inside. You need to record your statement on video for the customs officer." | tags: video_call_demand, authority, fear | sev: 3
- "For the complaint we need to verify your identity. please tell me your full Aadhaar number, date of birth and the bank where you hold your main account." | tags: personal_info, authority | sev: 4
- "Aap ghabraaiye mat, hum aapki madad karenge. Bas cyber cell ko sab clearly bataiye aur jo officer bole waisa kariye." | tags: reciprocity, authority, isolation | sev: 2

### IN-03 TRAI / DoT SIM disconnection

**Description.** Pre-recorded call from a normal 10-digit number: "Your mobile number will be disconnected in 2 hours; press 9 / press 1." A "TRAI officer" says another SIM issued on your Aadhaar in Mumbai/Delhi is being used for harassment or fraud; a police "NOC" is required. Transfers to "cyber police" → IN-01. TRAI has stated it never calls to disconnect numbers; DoT actually disconnects via telcos with SMS notices, not calls.

**Script arc.** Robocall hook → "TRAI officer" recites FIR number, shop address where second SIM was bought → "we need a clarification from police" → conference with "Mumbai cyber cell" → digital arrest.

- "This is a call from Telecom Regulatory Authority of India. All your mobile numbers will be blocked within 2 hours due to illegal activities. To know more, press 9." | tags: authority, urgency, fear | sev: 3
- "Sir, aapke Aadhaar par ek aur SIM issue hui hai, Mumbai Ghatkopar ke Vodafone store se. Us number se obscene messages bheje gaye hain aur uske against FIR number 0421/2026 registered hai." | tags: authority, account_compromise_pretext, legal_threat | sev: 3
- "Your number is being used for money laundering and harassment. Department of Telecom has issued a disconnection order for all 3 numbers linked to your Aadhaar." | tags: authority, fear, account_compromise_pretext | sev: 3
- "If you were not aware of this SIM, we need a clarification letter from the police. I'll connect you to the Mumbai cyber cell. please hold." | tags: authority, hold_the_line, verification_bypass | sev: 3
- "I am Deputy Officer Sanjay Mishra, employee ID TR-4471. Note this down. you will need it for the complaint." | tags: authority | sev: 2
- "Ma'am, do not hang up. Once the call disconnects, the block order goes through automatically and even your bank OTPs will stop coming." | tags: hold_the_line, urgency, fear | sev: 3
- "To keep your number active you have to verify KYC again. Share the OTP that just came from your operator." | tags: otp_request, urgency, authority | sev: 5
- "Aapka number 2 ghante mein band ho jayega. Isko rokne ke liye abhi 1 dabaiye aur officer se baat kariye." | tags: urgency, fear | sev: 3
- "The SIM in Mumbai was used to send threatening messages to a woman. A case under IT Act 67 is registered. You have to give a statement to the police on video today." | tags: legal_threat, video_call_demand, fear | sev: 4
- "This is Sanchar Saathi portal verification. To remove the fraud SIM from your name, pay ₹2,500 re-verification charge via the link I am sending." | tags: payment_method, authority | sev: 4

### IN-04 Bank KYC / account block / OTP

**Description.** Caller claims to be from the bank (SBI, HDFC, ICICI, PNB, Paytm Payments Bank) saying KYC expired, PAN not linked, or account will be blocked today. Asks victim to click link, install "SBI YONO KYC" APK, or read OTP; also "we are updating your details, confirm the OTP you received to complete". Common with pensioners.

**Script arc.** "KYC pending / account block today" → ask for card number, CVV, expiry, DOB → "OTP has been sent for verification, please tell" → funds drained → "another OTP to reverse the charge".

- "Hello, I'm calling from SBI head office KYC department. Your KYC is expiring today; if not updated, your account will be blocked by tonight." | tags: authority, urgency, fear | sev: 3
- "Aapka PAN card account se link nahi hua hai. Aaj hi update nahi kiya toh account freeze ho jayega aur pension aana band ho jayegi." | tags: urgency, fear, authority | sev: 3
- "To update KYC from home, I'll send you a link on SMS. Just enter your account number, debit card number, expiry and the CVV on the back." | tags: personal_info, authority | sev: 4
- "Ma'am, an OTP has just been sent to your registered number for KYC verification. Please read it to me. this is only for verification, no transaction will happen." | tags: otp_request, verification_bypass | sev: 5
- "Sir, download the 'SBI Quick Support' app from the link I'm sending on WhatsApp. it's the official app for online KYC." | tags: remote_access, tech_pretext, authority | sev: 5
- "Don't worry sir, this is a recorded line from the bank, everything is secure. Aap bas OTP bata dijiye, main system mein daal deta hoon." | tags: otp_request, authority | sev: 5
- "Your net banking has been accessed from an unknown device in Kolkata. To secure it, we'll reset your password. tell me the 6-digit code you just received." | tags: account_compromise_pretext, otp_request, fear | sev: 5
- "Sir, KYC update ke liye ₹10 ka token payment hota hai, bas link par jaake pay kar dijiye, refund ho jayega." | tags: payment_method, verification_bypass | sev: 4
- "Please don't visit the branch, the branch KYC queue takes 15 days. This telephonic KYC is the fast-track option approved by RBI." | tags: verification_bypass, authority | sev: 3
- "I can see your account is showing 'KYC Non-Compliant. Debit Freeze in 4 hours'. I'm here to help you avoid that." | tags: urgency, fear, reciprocity | sev: 3
- "For security, confirm your mother's maiden name, date of birth and the last four digits of your Aadhaar." | tags: personal_info | sev: 4
- "Sir, the OTP you told me was wrong, one more OTP is coming, please tell that one quickly before it expires." | tags: otp_request, urgency, escalation | sev: 5

### IN-05 Credit card fraud dept / limit / reward points

**Description.** "Fraud detection" call about a suspicious transaction, or a "reward points expiring" / "lifetime free upgrade" / "limit enhancement" offer. Either route ends in card details + OTP, or in a remote-access app. Also "card will be blocked unless you convert points".

- "This is HDFC card fraud prevention. A transaction of ₹49,999 at Croma, Delhi is being attempted on your card. Did you authorise it?" | tags: account_compromise_pretext, authority, fear | sev: 2
- "To block that transaction I need to verify the card. Read the 16-digit number and the CVV, and then the OTP that comes." | tags: otp_request, personal_info | sev: 5
- "Sir, your 8,450 reward points worth ₹8,450 are expiring at midnight today. I can redeem them to your account, just confirm the OTP." | tags: too_good, urgency, otp_request | sev: 5
- "Aapke card par international transaction hua hai, 300 dollar Amazon USA. Cancel karne ke liye OTP share kariye." | tags: account_compromise_pretext, otp_request | sev: 5
- "Your card is eligible for a limit increase to ₹5 lakh with zero annual fee. To activate, tell me the OTP sent for e-consent." | tags: too_good, otp_request | sev: 5
- "Ma'am, I'm sending a secure form on WhatsApp for the chargeback; fill in card number, expiry and CVV and upload a selfie with your PAN." | tags: personal_info, tech_pretext | sev: 4
- "Please don't hang up and call the number on the back of the card. that line goes to the retail team, they can't stop a fraud in progress." | tags: verification_bypass, hold_the_line | sev: 3
- "The OTP you are receiving is to cancel the transaction, not to approve it. That's why it says ₹49,999. ignore the message text." | tags: otp_request, verification_bypass | sev: 5
- "We will temporarily block your card; to issue a new one we need your Aadhaar and PAN details over the phone right now." | tags: personal_info, urgency | sev: 4
- "Annual fee of ₹2,999 will be charged tomorrow. Say yes to waive it and share the confirmation code." | tags: otp_request, urgency, too_good | sev: 5

### IN-06 Electricity bill disconnection

**Description.** SMS/WhatsApp from a 10-digit number: "Dear consumer, your electricity power will be disconnected tonight at 9:30 PM from electricity office because your previous month bill was not updated. Contact our electricity officer 98xxxxxxxx." Calling leads to a "lineman"/"junior engineer" who asks for ₹10–₹20 "update payment" via link/APK (often a screen-sharing or SMS-forwarding app), then drains the account.

- "Dear consumer, your electricity power will be disconnected tonight at 9.30 PM because your previous month bill was not updated. Please contact our electricity officer immediately." | tags: urgency, fear, authority | sev: 3
- "Sir, aapka bill system mein update nahi hua. Aaj raat ko connection cut ho jayega. Main junior engineer bol raha hoon, abhi rukwa sakta hoon." | tags: urgency, authority, reciprocity | sev: 3
- "The disconnection is already in the queue. To stop it you need to pay ₹10 verification charge through the link so your meter number gets updated." | tags: payment_method, urgency | sev: 4
- "Install the 'MSEDCL Bill Update' app I'm sending on WhatsApp and enter your consumer number and UPI details." | tags: remote_access, tech_pretext | sev: 5
- "Ma'am, the online portal is down due to a glitch. That's why the bill shows unpaid. I'll fix it on my end if you share screen through this app." | tags: tech_pretext, remote_access, verification_bypass | sev: 5
- "Do the payment on this Paytm number. it is our regional officer's collection account. The bill receipt will be updated in 5 minutes." | tags: payment_method | sev: 4
- "If you go to the office tomorrow it will already be cut; reconnection charge is ₹3,500 plus one week. Better to update now." | tags: urgency, fear | sev: 3
- "You have received a request of ₹1 on your UPI. please approve it to confirm your account, after that your bill will be updated." | tags: verification_bypass, payment_method | sev: 5
- "Bijli office se bol raha hoon. Meter reading mismatch hai, penalty lagegi. Abhi ₹499 online bhar do to case close." | tags: authority, payment_method, urgency | sev: 4

### IN-07 Income-tax refund

**Description.** Two sub-variants: (a) "refund approved, verify/update account" via link or call collecting bank details and OTP; (b) "notice under section 148, penalty payable today or prosecution". Peaks July–September and after processing season.

- "Sir, this is from the Income Tax Department e-filing helpdesk. A refund of ₹15,490 has been approved for AY 2025-26 but your bank account failed validation." | tags: authority, too_good | sev: 2
- "To release the refund, confirm your account number, IFSC and the OTP that comes from the e-filing portal." | tags: otp_request, personal_info | sev: 5
- "Aapka refund pending hai kyunki PAN-Aadhaar link nahi hai. Link par click karke ₹1,000 late fee bhariye, refund 24 ghante mein aa jayega." | tags: payment_method, authority | sev: 4
- "Your return has been selected for scrutiny. A penalty of ₹42,000 under section 270A is due. Pay today via the challan link, otherwise prosecution proceedings begin." | tags: legal_threat, urgency, payment_method | sev: 4
- "This is a final reminder from CPC Bengaluru. Ignoring this will lead to freezing of your bank accounts by the assessing officer." | tags: fear, urgency, authority | sev: 3
- "Ma'am, the refund of 28,300 will go to a wrong account unless you update. I'll help you. just install the 'ITD e-Verify' app." | tags: remote_access, authority, too_good | sev: 5
- "For refund verification, share the OTP you got from 'ITDEFL'. It's not a transaction OTP, it's a KYC OTP." | tags: otp_request, verification_bypass | sev: 5
- "We can process a bigger refund for you if you pay the CA verification fee of ₹2,500 now." | tags: too_good, payment_method | sev: 4

### IN-08 Lottery / prize / KBC / Jio lucky draw

**Description.** WhatsApp voice notes/calls with KBC/Amitabh Bachchan branding, "Jio lucky draw", "Flipkart Big Billion prize". Victim "won" ₹25 lakh; must pay GST/processing/"RBI clearance" fees, often from +92 numbers. Escalates through successive fees.

- "Congratulations! Aapka mobile number KBC Jio lucky draw mein select hua hai. Aapne 25 lakh rupaye jeete hain." | tags: too_good | sev: 2
- "Your lottery number is 8877. The cheque of 25 lakh is ready with our manager Rana Pratap Singh in Mumbai head office." | tags: too_good, authority | sev: 2
- "To transfer the prize you have to first pay the GST of 4.5 percent. ₹12,500. to our government account. Uske bina RBI release nahi karega." | tags: payment_method, authority, reciprocity | sev: 4
- "Ye baat kisi ko mat batana, warna tax department aapke inaam ko rok dega." | tags: secrecy, fear | sev: 3
- "Sir, you have to claim within 24 hours, otherwise the prize goes to the next lucky number." | tags: urgency, too_good | sev: 3
- "For verification, send a photo of your Aadhaar, bank passbook and a selfie holding both." | tags: personal_info | sev: 4
- "The 12,500 you sent was received, but the bank has now asked for ₹28,000 insurance charge on the prize amount. after that the full 25 lakh comes to your account." | tags: escalation, payment_method | sev: 5
- "Do not call this number back, only WhatsApp. Our manager will call you from a private number." | tags: isolation, verification_bypass | sev: 3
- "Amitabh Bachchan ji ki taraf se badhai. Aapko WhatsApp par lottery certificate bhej raha hoon, dekh lijiye." | tags: too_good, social_proof | sev: 2
- "You have won a Tata Safari car in the Flipkart lucky draw. Pay ₹6,500 registration fee or take the cash option of 12.6 lakh after paying tax." | tags: too_good, payment_method | sev: 4

### IN-09 Loan app harassment / recovery extortion

**Description.** Victim downloaded an instant-loan app (or was never a borrower. contact scraped from a friend's phone). "Recovery agents" call from multiple numbers, threatening to send morphed nude photos to all contacts, file FIRs, or visit with police. Amounts demanded are often multiples of the original micro-loan. Linked to suicides in India.

- "You have defaulted on your ₹3,000 loan. The penalty is now ₹9,600. Pay within one hour or we will inform all your contacts that you are a fraud." | tags: fear, urgency, payment_method | sev: 4
- "Hum aapki photo edit karke aapke saare contacts ko bhej denge. family, office, sab ko. Paisa bhejo abhi." | tags: fear, escalation, payment_method | sev: 5
- "Your phone contacts are with us. We already sent a message to your boss and your brother-in-law. Next is your daughter's college group." | tags: fear, social_proof, escalation | sev: 4
- "This is the legal department. An FIR is being lodged under cheating section 420 today. Police will come to your residence." | tags: legal_threat, authority, fear | sev: 4
- "Madam, we have a morphed picture of your daughter. It will go on WhatsApp and Facebook if payment is not received by 5 PM." | tags: fear, urgency, relationship_pretext | sev: 5
- "You never took the loan? Doesn't matter, your number is the guarantor. Pay or face the same consequences." | tags: fear, verification_bypass | sev: 4
- "Pay on this UPI ID only. the app's payment gateway is 'under maintenance'." | tags: payment_method, verification_bypass | sev: 5
- "Don't block this number, we have 200 more. Every call will be recorded and used in court." | tags: escalation, legal_threat | sev: 3
- "Bhai settle kar lo, ₹5,000 abhi bhej do, main file close kar dunga aur photo delete kar dunga." | tags: payment_method, reciprocity | sev: 5

### IN-10 Job / task scam (YouTube likes, Telegram prepaid tasks)

**Description.** WhatsApp DM from "HR" offers part-time work: like YouTube videos/rate hotels/review products, ₹50–₹150 per task. Small real payouts build trust, then the Telegram "mentor" moves to "prepaid merchant tasks" (deposit ₹1,000 → get ₹1,300), then "combination tasks", "VIP levels"; a fake dashboard shows earnings; "you skipped a step, funds locked, pay ₹15,000 to unlock", then "tax" on withdrawal.

- "Hi, I'm Priya from the HR team of Digital Marketing Pvt Ltd. We are offering part-time work from home, 2,000 to 8,000 per day, just liking YouTube videos. Are you interested?" | tags: too_good, relationship_pretext | sev: 2
- "Your first three tasks are complete, ₹150 has been sent to your UPI. Please check and confirm. this is how genuine our platform is." | tags: reciprocity, social_proof, too_good | sev: 2
- "Now join our Telegram group with the receptionist. Your tutor will assign you the merchant tasks which pay 30 percent commission." | tags: social_proof, isolation | sev: 3
- "After completing 3 prepaid transaction tasks you become an official member and are eligible for the VIP group. Indicate the chosen amount of ₹1,000 to receive ₹1,300." | tags: payment_method, too_good | sev: 4
- "See the screenshots in the group. Rahul withdrew 46,000 today, Meena 1.2 lakh. Everyone who completes the combination task gets it." | tags: social_proof, too_good | sev: 3
- "You skipped step 2 of the combination task, so the system has locked your account. You need to deposit ₹12,000 to unlock and then you can withdraw the whole 38,000." | tags: escalation, payment_method, verification_bypass | sev: 5
- "This is a hassle-free bonus. the merchants have already paid us the margin, you just have to complete the order." | tags: too_good, verification_bypass | sev: 3
- "Withdrawal is being processed, but the platform's tax department requires 20 percent income tax to be paid first because your earnings crossed 50,000." | tags: escalation, payment_method | sev: 5
- "Please don't discuss the task amounts with anyone outside the group. Company policy. otherwise your account may be terminated." | tags: secrecy, isolation | sev: 3
- "If you skip this task your next payment will be only ₹20 and you lose the bonus. The window closes in 15 minutes." | tags: urgency, fear, payment_method | sev: 4
- "Transfer to this account name only. it is our merchant partner, not the company account, so don't worry if the name is different." | tags: payment_method, verification_bypass | sev: 5
- "Sir, thoda credit score badhana hai. ek last task 25,000 ka karo, phir total 1,10,000 turant withdraw ho jayega." | tags: escalation, too_good, payment_method | sev: 5

### IN-11 Investment / stock-tip / crypto WhatsApp groups (pig butchering)

**Description.** Victim is added to a WhatsApp/Telegram "VIP stock tips" group run by a fake "SEBI-registered analyst" or impersonating a known broker (Motilal Oswal, Zerodha, JP Morgan, Goldman). Members post profit screenshots (all scammers). Victim is guided to a fake app/website showing "institutional IPO allotment" and rising profits; when they try to withdraw, they must pay "tax", "AML verification" or "risk deposit". Wrong-number/romance entry ("sorry wrong number... but you seem nice") is the global pig-butchering variant.

- "Welcome to the VIP Wealth Group. I'm Rakesh Sharma, SEBI-registered research analyst. Today's free tip: buy IRFC at 138, target 152." | tags: authority, too_good, social_proof | sev: 2
- "Our institutional account gets guaranteed IPO allotment. members got 100 percent on the last three IPOs. Screenshots are in the group." | tags: too_good, social_proof | sev: 3
- "To start, download our 'MO Investor Pro' app from the link (not Play Store. Play Store version is for retail clients only)." | tags: tech_pretext, verification_bypass, remote_access | sev: 4
- "Deposit through the 'company account' the assistant sends you; it changes every day for security, so always confirm with her first." | tags: payment_method, verification_bypass | sev: 5
- "Bhai, market mein aisa mauka baar baar nahi aata. Block trade ka window sirf aaj 3 baje tak hai." | tags: urgency, too_good | sev: 3
- "Your account shows a profit of ₹9.4 lakh. To withdraw above ₹5 lakh you must pay 15 percent capital gains tax to the platform first; it can't be deducted from the balance as per SEBI rules." | tags: escalation, payment_method, authority | sev: 5
- "Sorry, wrong number! But since we're talking... what do you do? I'm a gold-futures trader in Singapore." | tags: relationship_pretext, too_good | sev: 1
- "I made $40,000 last month from my uncle's insider strategy. I don't want anything from you. I just want you to see what's possible." | tags: too_good, social_proof, reciprocity | sev: 2
- "Your withdrawal is frozen by the anti-money-laundering system. A 'credit score deposit' of 30 percent of the balance is needed; it is refunded together with the full amount." | tags: escalation, payment_method, verification_bypass | sev: 5
- "Please don't consult your bank or your broker friend, they will be jealous and give you negative advice. Trust the data." | tags: isolation, verification_bypass | sev: 3
- "Take a small loan and invest. the 40 percent return in 10 days will cover the interest many times over." | tags: too_good, escalation | sev: 4
- "Teacher says the group will close for new members tomorrow. Only 3 slots left for the pre-IPO block." | tags: urgency, social_proof | sev: 3
- "USDT is safest for international investing. Buy on Binance P2P, then send to this wallet address; I'll walk you through it on screen share." | tags: payment_method, remote_access | sev: 5

### IN-12 UPI / cashback / QR code / collect request

**Description.** Variants: "Scan this QR to receive your refund" (scanning + PIN = paying); "accept the collect request of ₹1 to verify"; "enter UPI PIN to receive cashback"; OLX buyer sends "payment" screenshot then "scan to get your money". Also fake "Paytm KYC" and "PhonePe wallet expiring".

- "Sir, your Zomato refund of ₹1,250 is ready. Scan the QR I'm sending and enter your UPI PIN to receive it." | tags: too_good, otp_request, verification_bypass | sev: 5
- "I am the buyer for your sofa on OLX. I've sent a Google Pay request. just approve it and the money will credit." | tags: verification_bypass, payment_method | sev: 5
- "Aapke PhonePe wallet pe ₹5,000 cashback lock hua hai. Receive karne ke liye 'Pay' dabaiye aur PIN daaliye, amount aapko milega." | tags: too_good, otp_request, verification_bypass | sev: 5
- "The ₹1 transaction is just to verify your account is active. Do it now and the ₹20,000 you won will arrive." | tags: verification_bypass, payment_method | sev: 5
- "Your UPI ID has been suspended due to a failed transaction. Reactivate by sending ₹1 on this number." | tags: fear, payment_method | sev: 4
- "Ma'am, I'm from Paytm. Your KYC lapses in 1 hour; install this app so I can update it remotely." | tags: urgency, remote_access | sev: 5
- "Don't worry, you're not paying. the system takes your PIN to receive. That's why it asks. It's a bank rule." | tags: verification_bypass, otp_request | sev: 5
- "I've put the money in your account via 'Request'. You'll see 'Pay ₹22,000'. that's just the interface, click accept." | tags: verification_bypass, payment_method | sev: 5
- "Sir, galti se 15,000 aapke account mein aa gaya. Please us number par wapas kar dijiye, warna police complaint karni padegi." | tags: reciprocity, legal_threat, payment_method | sev: 4

### IN-13 Amazon / Flipkart order fraud / delivery OTP

**Description.** "Order for iPhone worth ₹79,900 placed from your account, press 1 if not you." Agent says account hacked, asks for OTP/card details or remote app. Delivery-agent variant: "Sir, I'm at your gate, to cancel the wrong delivery share the OTP you received."

- "This is an automated call from Amazon. An order for an iPhone 15 Pro worth ₹1,29,900 has been placed from your account. Press 1 if you did not place this order." | tags: account_compromise_pretext, fear | sev: 2
- "Your Amazon account has been accessed from Bhubaneswar. To cancel and secure the account, I'll need the OTP that Amazon sends now." | tags: account_compromise_pretext, otp_request | sev: 5
- "Sir, main Flipkart delivery partner hoon. Aapka parcel galat address pe aa gaya hai, cancel karne ke liye jo OTP aaya hai woh bata do." | tags: otp_request, tech_pretext | sev: 5
- "Your Prime membership auto-renewal of ₹1,499 has failed. Update your card details on the link to avoid account suspension." | tags: urgency, personal_info | sev: 4
- "To reverse the charge, please install the Amazon Secure Support app so our technician can see the fraudulent order." | tags: remote_access, tech_pretext | sev: 5
- "The hackers used your saved card. Read me the card number so I can check if it matches the one they used." | tags: personal_info, account_compromise_pretext | sev: 4
- "Refund of ₹2,999 for the damaged product is approved. Enter your UPI PIN on the refund page to accept." | tags: too_good, otp_request, verification_bypass | sev: 5
- "If we don't secure the account within 10 minutes the order ships and Amazon cannot refund." | tags: urgency, fear | sev: 3

### IN-14 Insurance / policy-maturity / IRDAI

**Description.** Caller from "IRDAI / LIC / HDFC Life claims department": your policy bonus/maturity/lapsed fund value is stuck; pay GST, NOC, "agent commission recovery" or "IRDAI verification fee" to release. Also "your agent has been cheating you; we'll switch your policy to a better one". Often repeated over months with new fees.

- "Sir, I am calling from IRDAI, Hyderabad. Your LIC Jeevan Anand policy has a pending bonus of ₹4,20,000 that your agent never told you about." | tags: authority, too_good | sev: 2
- "To release the fund value, an NOC fee of ₹18,500 has to be deposited in the IRDAI account. It is refundable with the bonus." | tags: payment_method, authority, reciprocity | sev: 4
- "Aapka agent aapko cheat kar raha tha. Hum policy ko revive karke poora paisa 15 din mein wapas dilwayenge, bas GST pay kar dijiye." | tags: too_good, payment_method | sev: 4
- "This offer is only through IRDAI's grievance cell. Do not contact your branch; they will deny it because it's their mistake." | tags: verification_bypass, isolation, authority | sev: 3
- "The cheque was dispatched but returned; the bank has now asked for 2 percent TDS clearance before reissuing." | tags: escalation, payment_method | sev: 5
- "We need your policy number, PAN, Aadhaar and a cancelled cheque photo for the release file." | tags: personal_info | sev: 4
- "Sir, this is the final chance; after 31st the unclaimed amount goes to the Senior Citizens' Welfare Fund." | tags: urgency, fear | sev: 3
- "You can also enrol in the new high-return plan. just pay the first premium to our nodal account today to lock the rate." | tags: too_good, payment_method | sev: 4

### IN-15 Government scheme / subsidy

**Description.** "PM Kisan instalment / Ayushman card / scholarship / LPG subsidy / PM Awas amount pending. update your Aadhaar-linked account via link/OTP/APK." Also "PM Kisan e-KYC app" malicious APK. Rural and semi-urban targets.

- "Namaskar, PM Kisan Samman Nidhi se bol raha hoon. Aapki 17vi kist rukhi hui hai kyunki e-KYC pending hai." | tags: authority, account_compromise_pretext | sev: 2
- "Install the 'PM Kisan e-KYC' app from this link and enter your Aadhaar and bank details to release ₹2,000." | tags: remote_access, personal_info, too_good | sev: 5
- "Your Ayushman card is being deactivated; to keep the 5 lakh cover, confirm the OTP." | tags: fear, otp_request | sev: 5
- "Beta, scholarship of ₹48,000 is sanctioned for your daughter. A processing charge of ₹1,200 goes to the state treasury." | tags: too_good, payment_method, authority | sev: 4
- "Gas subsidy of ₹3,600 is pending in your name. Share your bank account number and the OTP to link it." | tags: too_good, otp_request | sev: 5
- "This is from the District Collector's office. Your PM Awas amount is ready; the last date to verify is today." | tags: authority, urgency | sev: 3
- "Aap link par ₹1 ka verification karo, uske baad 5,000 ka labh seedha account mein aayega." | tags: verification_bypass, payment_method | sev: 5

### IN-16 Army-man / CSD OLX-Quikr scam

**Description.** On OLX/Quikr/Facebook Marketplace, a "jawan posted at the airport/cantonment" sells a car, bike, furniture or buys from you. Shares Aadhaar, Army ID/CSD canteen card photos to establish trust. Asks advance/security deposit via Paytm for "Army postal service", then "insurance", "courier tax". Buyer variant sends a QR/collect request.

- "Sir, I am Havildar Rajesh Kumar, posted at CRPF camp near Jaipur airport. I'm getting transferred next week so selling my Bullet urgently at half price." | tags: relationship_pretext, too_good, urgency | sev: 2
- "Main Army mein hoon, vishwas ke liye Aadhaar aur canteen card bhej raha hoon. Fauji kabhi dhoka nahi deta." | tags: social_proof, relationship_pretext | sev: 2
- "I can't come out of the cantonment to meet. The vehicle will be delivered by Army courier; just pay ₹5,000 token on Paytm to book the transport." | tags: payment_method, verification_bypass | sev: 4
- "Courier has left but the checkpost needs transit insurance of ₹8,000. It's refundable at delivery." | tags: escalation, payment_method | sev: 5
- "Sir, I want to buy your fridge. I'm sending payment via Google Pay. scan this QR and enter PIN to receive." | tags: verification_bypass, otp_request | sev: 5
- "The Army merchant account only accepts advance payment. Rules are strict, I can't take cash." | tags: verification_bypass, payment_method | sev: 4
- "Duty par hoon, network kam hai, jaldi karo. Aur bhi buyers hain, jo pehle paisa dega usko milega." | tags: urgency, social_proof | sev: 3
- "You're not trusting a soldier? I've shared my posting order. what more do you want?" | tags: reciprocity, social_proof | sev: 2

### IN-17 Fake customer-care numbers

**Description.** Victim searches for a customer-care number (IndiGo, Swiggy, SBI, Amazon, bank, gas agency) and gets a planted number (Google Business listings, JustDial, fake sites). Because the victim initiated the call, suspicion is low. The "agent" resolves the issue by asking for card details, OTP, or by installing AnyDesk/TeamViewer/Screen Share.

- "Thank you for calling IndiGo customer support. For the refund of your cancelled flight, I'll need the card details used for booking." | tags: personal_info, tech_pretext | sev: 4
- "Sir, refund process ke liye ek app install karna hoga, 'Customer Support Assist'. Uska 9-digit code bata dijiye." | tags: remote_access, tech_pretext | sev: 5
- "To verify you're the account holder, please tell me the OTP that the bank just sent." | tags: otp_request | sev: 5
- "Your complaint is registered. A ₹5 test transaction will be done to validate the refund channel. approve it on your UPI app." | tags: verification_bypass, payment_method | sev: 5
- "Ma'am, don't close the screen-sharing until the refund shows. it takes 10 minutes and I need to see the confirmation." | tags: hold_the_line, remote_access | sev: 4
- "The refund link is on WhatsApp; fill in card number, expiry, CVV and the amount you want back." | tags: personal_info | sev: 4
- "Your gas cylinder booking is blocked. Pay ₹199 reactivation on this UPI ID and the delivery will come today." | tags: payment_method, urgency | sev: 4

### G-01 Tech support (Microsoft / Apple / Amazon / Norton / Geek Squad)

**Description.** Pop-up with a phone number, or cold call "from Windows technical department". Victim is talked into a remote session (AnyDesk, TeamViewer, UltraViewer, GoToAssist), shown Event Viewer "errors" or netstat "foreign connections", charged $199–$499 for "lifetime protection", or pivoted to bank "hackers are in your account". Also subscription-renewal variant ("Norton $399 charged to your card, call to cancel").

- "Hello, this is John from the Windows technical department. We have been receiving error reports from your computer's IP address." | tags: tech_pretext, authority | sev: 2
- "Your computer has been hacked. Foreign hackers from Russia are using it right now. Don't turn it off. if you do, you lose all your files." | tags: fear, tech_pretext, hold_the_line | sev: 3
- "Press the Windows key and R together and type www.anydesk.com. Then read me the 9-digit ID on your screen." | tags: remote_access | sev: 5
- "Do you see all these red errors in the Event Viewer? Every one of them is a virus. Your license has expired." | tags: tech_pretext, fear | sev: 3
- "Your Norton subscription has auto-renewed for $399.99. If you want to cancel, our refund department will need remote access to process it." | tags: tech_pretext, reciprocity, remote_access | sev: 4
- "Now open your online banking so I can check whether the hackers have touched your account." | tags: remote_access, account_compromise_pretext | sev: 5
- "The lifetime network protection is $299. We accept Google Play or Target gift cards; go to Walgreens and I'll stay on the line." | tags: payment_method, hold_the_line | sev: 5
- "Ma'am, don't tell the store clerk why you're buying the cards. They are not trained about this level of security issue." | tags: secrecy, verification_bypass | sev: 4
- "Your Apple ID has been used to purchase $1,300 of iTunes credit in China. Press 1 to speak to Apple security." | tags: account_compromise_pretext, fear | sev: 2
- "I am going to install a firewall on your computer; your screen will go black for a few minutes, that's normal, please do not touch the mouse." | tags: remote_access, tech_pretext | sev: 5
- "This case number is CS-77120. Write it down. Our senior technician will call you tomorrow to verify the protection is working." | tags: authority, escalation | sev: 2

### G-02 Tech-support refund / overpayment

**Description.** Cold call or email: "You bought our support 2 years ago; we're closing/you're owed $299/$399 refund." During remote session victim logs in to bank; scammer edits the HTML of the balance page or transfers between the victim's own accounts, making it look like $29,900 was deposited instead of $299. Scammer acts panicked ("I'll lose my job"), demands victim return the "excess" via gift cards, cash mailed in a book, crypto ATM, or wire.

- "Sir, this is regarding the tech support you purchased in 2023. Our company is shutting down and the court has ordered us to refund all customers. You are owed $399." | tags: reciprocity, too_good, authority | sev: 2
- "To process the refund we need access to your computer to fill out the refund form. Please download the Ultraviewer application." | tags: remote_access, reciprocity | sev: 5
- "Now log in to your online banking so the refund goes to the right account. I will not look, I'll turn my screen off." | tags: remote_access, verification_bypass | sev: 5
- "Please type the refund amount in the box: three, nine, nine. Press enter... Oh my God. Sir, you typed 39,900. You typed an extra zero." | tags: tech_pretext, fear, verification_bypass | sev: 4
- "Look at your account. 39,900 dollars have been deposited. This is the company's money. I will lose my job and my family, sir, please help me." | tags: reciprocity, fear, escalation | sev: 4
- "The bank cannot reverse it because it is an international transaction. The only way is for you to return the excess in Target gift cards." | tags: payment_method, verification_bypass | sev: 5
- "Do not tell the cashier it's for a refund; say it's for your grandchildren. Otherwise they'll block the card and the money is stuck." | tags: secrecy, verification_bypass | sev: 4
- "Sir, put the cash in a magazine, wrap it in aluminium foil, and FedEx it overnight to this address. I'll stay on the line while you drive." | tags: payment_method, hold_the_line | sev: 5
- "The Bitcoin machine at the gas station is the fastest way to return the company funds. I'll send you the QR code of the company wallet." | tags: payment_method | sev: 5
- "I'm not asking for your money, I'm asking for OUR money back that you received by mistake." | tags: reciprocity, verification_bypass | sev: 4

### G-03 Grandparent / family emergency (voice clone)

**Description.** Call from "grandchild" (crying, "my nose is broken so I sound different", now often AI-cloned from social media clips): car accident/DUI/arrest abroad; then a "public defender", "bail bondsman" or "officer" takes over. Cash collected by courier at the door, or gift cards/crypto/wire. "Gag order. don't tell Mom and Dad." Virtual kidnapping variant: screaming in background, "we have your daughter".

- "Grandma? It's me. I'm in trouble. I've been in an accident and I'm at the police station. Please don't be mad." | tags: relationship_pretext, fear | sev: 2
- "I sound different because my nose got broken in the crash. They took my phone, this is the officer's phone." | tags: relationship_pretext, verification_bypass | sev: 3
- "Please don't tell Mom and Dad. They'll kill me. I'll tell them myself once it's sorted." | tags: secrecy, isolation, relationship_pretext | sev: 4
- "Hello ma'am, this is Attorney Mark Feldman, public defender assigned to your grandson. There is a gag order on the case, so you cannot discuss it with anyone or he will lose his release." | tags: authority, secrecy, legal_threat | sev: 4
- "The bail has been set at $9,500. It has to be cash. A courier from the bond office can pick it up at your home within the hour." | tags: payment_method, urgency | sev: 5
- "If the money isn't posted by 5 PM he spends the weekend in county jail with the general population." | tags: urgency, fear | sev: 4
- "The bank will ask why you're withdrawing. Tell them it's for home renovations. The court doesn't allow you to discuss a minor's case." | tags: secrecy, verification_bypass | sev: 4
- "Dadi, main Dubai mein hoon, police ne pakad liya hai, bail ke liye 2 lakh chahiye abhi. Papa ko mat bolna." | tags: relationship_pretext, secrecy, urgency, payment_method | sev: 5
- "We have your daughter. Listen to her. [screaming] If you hang up or call anyone she gets hurt. Stay on the line and drive to the bank." | tags: fear, hold_the_line, isolation, payment_method | sev: 5
- "The judge agreed to reduce the bond if the balance comes in gift cards from Apple; read me the numbers on the back." | tags: payment_method, verification_bypass | sev: 5
- "It worked, he's being released. But the other driver was pregnant and lost the baby. now there's a second charge and another $15,000." | tags: escalation, fear, payment_method | sev: 5

### G-04 Romance

**Description.** Long-con via dating apps, Instagram, Facebook, "wrong number". Personas: deployed soldier, oil-rig engineer, doctor with WHO/UN, widowed businessman. Voice/video calls limited or deepfaked. Money asks: customs fee for a gift box, hospital bills, plane ticket to visit, "investment my uncle taught me" (→ pig butchering), or "your account can receive my inheritance".

- "I know we've only been talking for three weeks, but I've never felt this connection with anyone. I'll be honest, I've been hurt before." | tags: relationship_pretext | sev: 1
- "The camera on the rig is broken and the signal is too weak for video, but I'll send you a voice note every morning." | tags: verification_bypass, relationship_pretext | sev: 2
- "I sent you a package with a gold necklace and some cash for our future. The courier company in Malaysia is asking for $1,850 customs clearance." | tags: reciprocity, payment_method | sev: 4
- "My leave has been approved but the military requires a $3,200 leave-processing fee paid by the family member. You are the only family I have." | tags: relationship_pretext, payment_method, verification_bypass | sev: 5
- "Please don't tell your children about us yet. They won't understand until they meet me." | tags: secrecy, isolation | sev: 3
- "I've been making 12 percent a week on a crypto platform my mentor introduced. Let me show you how. start with just $500." | tags: too_good, relationship_pretext | sev: 4
- "If you really loved me you wouldn't hesitate. I've given you my whole heart." | tags: reciprocity, relationship_pretext, escalation | sev: 3
- "My daughter was in an accident and the hospital in Turkey won't operate without a deposit. I'm begging you, I'll pay you back when my contract pays out." | tags: fear, payment_method, relationship_pretext | sev: 5
- "Use Bitcoin. my bank account is frozen because I'm overseas. I'll send you the wallet address." | tags: payment_method, verification_bypass | sev: 5
- "I want to send my $2.4 million contract payment to your account for safekeeping; the bank just needs your login to set it up." | tags: too_good, personal_info | sev: 5

### G-05 Sextortion

**Description.** (a) Video-call sextortion: a match on Instagram/Facebook/dating app initiates a video call, recording follows; then "I'll send this to your contacts unless you pay". (b) Follow-up "cyber cell officer / YouTube team" calls to demand a "video deletion fee". (c) Webcam-hack email/call bluff. Targets men in India heavily; teens globally (Nigerian "Yahoo boys" variant).

- "I recorded our video call. I have your face and your contact list. Pay ₹25,000 in 30 minutes or it goes to your wife and your office group." | tags: fear, urgency, payment_method | sev: 5
- "Hello, I'm Inspector Sharma from Delhi Cyber Cell. A girl has complained against you and a video is uploaded on YouTube. To delete it, YouTube charges ₹45,000." | tags: authority, legal_threat, payment_method | sev: 5
- "Hi handsome, let's switch to video, I want to see you properly." | tags: relationship_pretext, video_call_demand | sev: 2
- "The girl has attempted suicide after your call. Her family is filing an FIR. If you pay the hospital 60,000 now the matter will be settled." | tags: fear, escalation, legal_threat, payment_method | sev: 5
- "We also have your mother's number and your daughter's Instagram. Don't test me." | tags: fear, isolation, relationship_pretext | sev: 4
- "I'm from the YouTube legal team. The video has 200 views already. Deletion request costs ₹15,000, you have one hour." | tags: authority, urgency, payment_method | sev: 5
- "Send Bitcoin to this address. Your webcam was hacked through a malware in an adult site. I have the footage split-screen." | tags: fear, tech_pretext, payment_method | sev: 4
- "Pay the first half now and I'll delete it in front of you on video call." | tags: payment_method, reciprocity | sev: 5

### G-06 Deepfake CEO / CFO / BEC wire fraud

**Description.** Finance employee receives a message "from the CFO" about a confidential transaction, then a video/voice call with deepfaked executive(s) (Arup, Hong Kong, Jan 2024: HK$200M / US$25.6M across 15 transfers to five accounts after a multi-person deepfake video meeting). Scripts stress confidentiality (acquisition, regulatory settlement, legal), time pressure (closing today, other time zone), and bypass of dual approval ("I'm approving verbally, the paperwork follows").

- "Hi, it's [CEO name]. I'm between meetings, can't talk long. I need you to handle something confidential for me today." | tags: authority, secrecy, urgency | sev: 3
- "We're closing a strategic acquisition and the target's lawyers require the deposit before the market opens in London. Legal has cleared it, but it's under NDA so it can't go through the normal approval chain." | tags: authority, secrecy, verification_bypass, urgency | sev: 4
- "I'll send you the beneficiary details on this thread. Don't loop in [CFO's assistant] or Treasury, they're not read into the deal." | tags: isolation, secrecy | sev: 4
- "Split it into three wires under the reporting threshold so the bank doesn't hold it." | tags: payment_method, verification_bypass | sev: 5
- "I know this is outside process. I'm taking responsibility. Consider this my verbal approval, I'll countersign when I land." | tags: authority, verification_bypass | sev: 4
- "Sorry about the video quality, I'm on hotel Wi-Fi. Can you hear me okay? Good, let's get through this quickly." | tags: verification_bypass, tech_pretext | sev: 2
- "The vendor changed their bank account. please update the payment details for the invoice due Friday, here are the new IBAN details." | tags: payment_method, account_compromise_pretext | sev: 4
- "This is a regulator settlement; if it leaks, the share price moves. Only you, me and outside counsel know." | tags: secrecy, fear, authority | sev: 4
- "I need this done in the next 40 minutes. Text me the confirmation number as soon as it's out." | tags: urgency | sev: 3
- "Why are you questioning this? I'd expect more from someone in your position. Just get it done." | tags: authority, escalation | sev: 3
- "Buy ten $500 Apple gift cards for client gifts and email me the codes; I'll reimburse from my expense account." | tags: payment_method, authority | sev: 5

### US-01 Jury duty / failure to appear

**Description.** "Deputy/Lieutenant [real officer name]" from the county Sheriff (spoofed caller ID) says the victim signed for a summons and failed to appear; two warrants issued (contempt, failure to appear); pay a "citation/bond" of $1,500–$5,000 via prepaid card, Zelle, Bitcoin ATM or "kiosk at the courthouse", and stay on the phone the whole time.

- "This is Lieutenant Daniels with the county Sheriff's Office. You were served a federal grand jury summons on August 3rd and failed to appear. Two warrants have been issued in your name." | tags: authority, legal_threat, fear | sev: 3
- "Ma'am, I'm giving you a courtesy call before we execute the warrant. You can resolve this over the phone today or a deputy will come to your workplace." | tags: legal_threat, urgency, reciprocity | sev: 4
- "The bond is $3,800 for the two citations. It's refundable once you appear before the judge next week." | tags: payment_method, verification_bypass | sev: 4
- "You have to stay on this recorded line; if the call drops it will be considered fleeing and the warrant becomes active." | tags: hold_the_line, legal_threat | sev: 4
- "Go to the CVS on Main Street and purchase MoneyPak vouchers. The court kiosk accepts them. Don't discuss the case with the cashier. it's a sealed matter." | tags: payment_method, secrecy, hold_the_line | sev: 5
- "Get in your vehicle now and drive to the courthouse. I'll give you further instructions on the way. Keep the phone on speaker." | tags: hold_the_line, isolation | sev: 4
- "Do not hang up and call the Sheriff's main line. they will just see the active warrant and dispatch." | tags: verification_bypass, fear | sev: 4
- "The judge has authorized a $1,000 per day fine while the warrant is outstanding." | tags: legal_threat, urgency | sev: 3
- "Your badge and case number are 44-71-B. Write it down, you'll need it at the kiosk." | tags: authority | sev: 2
- "Once you deposit, read me the voucher numbers so I can attach them to the docket." | tags: payment_method | sev: 5

### US-02 Social Security (SSA)

**Description.** Robocall or live "Officer" from SSA/OIG: "your Social Security number has been suspended due to suspicious activity", "a car rented in your name was found at the Texas border with drugs and blood", "27 bank accounts opened with your SSN". Move money to "protect it" (gift cards, crypto, cash), or confirm SSN/DOB for identity theft.

- "This is Officer Michael Brown from the Social Security Administration. Due to suspicious activities related to your Social Security number, we are forced to suspend your number with immediate effect. Press 1 to speak with the legal department." | tags: authority, fear, legal_threat | sev: 3
- "A vehicle rented under your Social Security number was found abandoned at the Texas border with 22 pounds of cocaine and blood stains." | tags: fear, account_compromise_pretext | sev: 3
- "There are 27 bank accounts opened in your name in the state of Texas. The DEA and the FBI are involved." | tags: fear, authority, account_compromise_pretext | sev: 3
- "Before we go further, confirm the last four of your Social so I know I'm speaking to the right person. actually, just read me the whole number." | tags: personal_info | sev: 4
- "Your bank accounts will be frozen within the hour. The only way to protect your funds is to move them into a government safe-keeping account." | tags: urgency, payment_method, fear | sev: 5
- "Because the accounts are compromised, we'll secure your money on eBay and Google Play gift cards. This is standard Treasury protocol." | tags: payment_method, verification_bypass | sev: 5
- "This is the final attempt to reach you. Ignoring this will be an intentional second attempt to avoid appearance before a magistrate judge." | tags: legal_threat, urgency | sev: 3
- "Do not talk to anyone about this, not even your bank. The investigation has identified employees at your branch." | tags: secrecy, isolation, verification_bypass | sev: 4
- "We'll issue you a new Social Security number once the investigation closes, but there's a $200 processing fee." | tags: payment_method | sev: 4
- "I'm going to transfer you to my supervisor at the Treasury, badge number 4409. Stay on the line." | tags: escalation, hold_the_line, authority | sev: 3

### US-03 IRS / tax

**Description.** "Final notice from the IRS: you owe $4,950 in back taxes; a lawsuit has been filed; police are on the way." Payment via iTunes/Google Play cards, "EFTPS vouchers", wire, or cryptocurrency. Also "refund of $1,200 stimulus/ERC, verify SSN".

- "This is the Internal Revenue Service. This is a final notice before legal action. You owe $4,950 in back taxes from 2021 to 2023." | tags: authority, legal_threat, urgency | sev: 3
- "A lawsuit has been filed against you and the local police have been notified. If you hang up, they'll come to arrest you within 45 minutes." | tags: legal_threat, fear, hold_the_line | sev: 4
- "You can settle today by purchasing tax vouchers. They're available at any Walgreens as Google Play cards." | tags: payment_method, verification_bypass | sev: 5
- "Do you have a lawyer? No? Then you need to cooperate with me directly to avoid the criminal side of this." | tags: isolation, authority | sev: 3
- "Your case ID is IRS-28-Q. Write it down for your records; this call is being recorded and monitored by the federal government." | tags: authority | sev: 2
- "There's also a $1,400 stimulus refund pending for you; confirm your SSN and bank routing number to release it." | tags: too_good, personal_info | sev: 4
- "We don't send letters for criminal cases. This is a courtesy call from the audit department." | tags: verification_bypass, authority | sev: 3
- "Keep me on the line while you drive to the store. the agent assigned needs to log the payment in real time." | tags: hold_the_line, payment_method | sev: 4
- "Read me the numbers on the back of each card, one at a time, slowly." | tags: payment_method | sev: 5

### US-04 Medicare

**Description.** Calls from "Medicare" or a "Medicare-approved" vendor: new plastic/chip card, free genetic/cancer screening test, free back/knee brace, "your plan is changing, confirm your Medicare number". Number is used for fraudulent billing and identity theft.

- "Hi, I'm calling from Medicare services. We're issuing new plastic Medicare cards with a chip and need to confirm your Medicare number to mail yours." | tags: authority, personal_info | sev: 4
- "Medicare has authorized a free back brace for you at no cost. I just need your Medicare ID and your doctor's name to ship it." | tags: too_good, personal_info | sev: 4
- "We'd like to send you a free DNA cancer-screening kit; it's covered 100 percent, so there's no charge. Just read me the number on your red, white and blue card." | tags: too_good, personal_info | sev: 4
- "Your current plan is being discontinued in your county. If you don't switch today, you'll lose coverage January 1st." | tags: fear, urgency | sev: 3
- "This is not a sales call, ma'am, it's a benefits verification for the annual enrollment." | tags: authority, verification_bypass | sev: 2
- "Your card has an error and needs to be replaced; without the correction your claims will be denied." | tags: fear, personal_info | sev: 3
- "To confirm your identity, please give me your date of birth and the address where your Social Security check is deposited." | tags: personal_info | sev: 4
- "I see you've been prescribed a diabetic medication. we can send you a free glucose monitor, just verify the last four of your Social." | tags: too_good, personal_info | sev: 4

### US-05 Utility shutoff

**Description.** "Your service will be disconnected in 30–60 minutes for non-payment; a technician is on the way." Targets restaurants during rush, and elderly in extreme weather. Pay by prepaid card, Zelle, crypto ATM, or "pay on this number now". Spoofs utility caller ID.

- "This is Con Edison billing. Your account is 45 days past due and a technician has been dispatched to disconnect service within the hour." | tags: authority, urgency, fear | sev: 3
- "You can stop the disconnection by paying $487 right now over the phone. We accept prepaid cards and Zelle." | tags: payment_method, urgency | sev: 5
- "The online system doesn't reflect the disconnect order. that's why it shows paid. The field order is separate." | tags: verification_bypass, tech_pretext | sev: 3
- "It's Friday afternoon at 4:30. If it's not resolved in 30 minutes, reconnection won't happen until Monday, and there's a $250 reconnect fee." | tags: urgency, fear | sev: 3
- "Your smart meter needs to be replaced; the $350 deposit must be paid today by prepaid card." | tags: payment_method, urgency | sev: 4
- "Go to the nearest Walmart and buy a Green Dot MoneyPak; I'll hold the disconnect order while you're on the line." | tags: payment_method, hold_the_line | sev: 5
- "Sir, your restaurant will lose power in the middle of dinner service. I'm trying to help you here." | tags: fear, reciprocity | sev: 3

### G-07 Amazon / Apple / PayPal impostor (US flavour)

**Description.** Robocall "suspicious order of $1,299 MacBook / $799 iPhone; press 1". Agent claims account and identity compromised, remote access to "check", then pivots to "your bank accounts are linked to money laundering; move funds to a Federal Reserve locker / buy gold / gift cards". Bridges tech-support and SSA scripts.

- "This is Amazon. A charge of $1,299 for an Apple MacBook Pro shipping to Cleveland, Ohio, was placed on your account. Press 1 to cancel." | tags: account_compromise_pretext, fear | sev: 2
- "I'm going to send you a secure link so I can see how the hackers got in. It's called AnyDesk, it's Amazon's secure portal." | tags: remote_access, tech_pretext | sev: 5
- "Your identity has been compromised in 4 states. I'm transferring you to the Federal Trade Commission's fraud line, badge number 2287." | tags: escalation, authority, fear | sev: 3
- "To protect your savings, we'll move them into a Federal Reserve secure locker; you'll withdraw cash and hand it to a federal courier." | tags: payment_method, authority | sev: 5
- "Buy gold bars from the dealer I'll give you; the agent will collect them at your door and issue a receipt." | tags: payment_method, escalation | sev: 5
- "Don't tell the bank teller anything about this; the hackers may be monitoring bank communications." | tags: secrecy, verification_bypass | sev: 4
- "Your PayPal account has been limited due to a $499 unauthorized payment to Bitcoin; call this number within 24 hours." | tags: account_compromise_pretext, urgency | sev: 2

### UK-01 Bank impersonation / "safe account" / courier fraud

**Description.** Caller (spoofing the bank's number, or "DC Smith from the Met's fraud squad") says the victim's account is being accessed / staff at the branch are counterfeiting / a card was cloned. Victim must move money to a "safe account", withdraw cash/buy gold/expensive watches "as evidence", and hand them to a courier/taxi; or keep the phone line open and "hang up and call 159/back of card" while the fraudster holds the line open (older landline trick). Never discuss with branch staff "because they're under investigation".

- "Good morning, I'm calling from the fraud team at Barclays. We've flagged a payment of £1,200 to Currys. did you make that?" | tags: authority, account_compromise_pretext | sev: 2
- "Your account has been compromised from the inside. We suspect a member of staff at your branch. For that reason you mustn't discuss this with anyone at the bank." | tags: secrecy, isolation, verification_bypass, fear | sev: 4
- "We need to move your money to a safe account while we investigate. I'll give you the sort code and account number now." | tags: payment_method, urgency | sev: 5
- "If the bank asks why you're making the transfer, tell them it's for a car purchase, otherwise the fraudster will be tipped off." | tags: secrecy, verification_bypass | sev: 4
- "This is Detective Constable Ryan from Hammersmith CID. We've arrested someone with a cloned copy of your card. We need your help with an undercover operation." | tags: authority, legal_threat, reciprocity | sev: 3
- "Withdraw £8,000 in cash so we can check the serial numbers for counterfeits. A plain-clothes officer will collect it in an unmarked car." | tags: payment_method, authority | sev: 5
- "Hang up now, call the number on the back of your card and ask for me. I'll be here." [line held open] | tags: verification_bypass, hold_the_line | sev: 4
- "Keep your phone on this call and go to the branch; if they ask, say you're withdrawing for a wedding." | tags: hold_the_line, secrecy | sev: 4
- "Read me the 6-digit code from your card reader so we can freeze the compromised card." | tags: otp_request, account_compromise_pretext | sev: 5
- "Your money is only insured if you act before the next transaction hits, which our system says is in 20 minutes." | tags: urgency, fear | sev: 3
- "We'd like you to buy a Rolex from the shop on Bond Street as part of the evidence trail. the funds will be reimbursed." | tags: payment_method, verification_bypass | sev: 5

### UK/AU-01 "Hi Mum / Hi Dad"

**Description.** WhatsApp/SMS from an unknown number: "Hi Mum, dropped my phone in the toilet / got a new number, save this one." Then "locked out of online banking, have a bill due today, can you transfer £950 to this account? I'll pay you back Friday." Increasingly with voice notes (cloned). Australia: $7.2M reported in 2022; UK: £226k 2023–25 (Action Fraud).

- "Hi Mum, this is my new number, my phone broke. Save this and delete the old one x" | tags: relationship_pretext | sev: 1
- "I'm on a friend's phone. Can you message me on WhatsApp when you see this? It's urgent." | tags: relationship_pretext, urgency | sev: 2
- "I can't get into my banking on this phone and I've got a bill due at 5 today. Can you send £980 to this account and I'll pay you back on Friday?" | tags: urgency, payment_method, relationship_pretext | sev: 5
- "Can't call, mic on this phone doesn't work, just text." | tags: verification_bypass | sev: 3
- "It's a new account, the name will show as Bradley. that's my mate whose phone I'm using." | tags: verification_bypass, payment_method | sev: 5
- "Please Mum, I'm stressed, they'll add a late fee. I'll explain everything tonight." | tags: urgency, reciprocity | sev: 3
- "Hi Dad, dropped my phone down the loo lol. Can you do me a favour?" | tags: relationship_pretext | sev: 1
- "Can you send it now? I'm literally standing at the counter." | tags: urgency | sev: 3

### AU-01 ATO / tax-debt

**Description.** Robocall "from the Australian Taxation Office" about an outstanding tax debt and an arrest warrant; live "officer" demands payment via iTunes/Google Play cards, Bitcoin, or bank transfer to a "tax office" account; keeps victim on the line; threatens arrest of family. myGov-suspension variant collects TFN/ID.

- "This is the Australian Taxation Office. A lawsuit has been filed against you for tax evasion. Call this number immediately or a warrant will be executed." | tags: authority, legal_threat, urgency | sev: 3
- "You have an outstanding tax debt of $8,240 from 2022. The Federal Police are on standby. Do you want to resolve this now or be arrested?" | tags: legal_threat, fear, urgency | sev: 4
- "The quickest way to clear the debt is through Bitcoin at the machine at your nearest shopping centre. the ATO has an arrangement with them." | tags: payment_method, verification_bypass | sev: 5
- "Buy Google Play cards to the value of $2,000 and read me the codes. It's a payment gateway the tax office uses for urgent settlements." | tags: payment_method | sev: 5
- "Do not hang up or speak to anyone else, including your accountant, until this is resolved; the warrant is suspended only while you're on this line." | tags: hold_the_line, isolation, legal_threat | sev: 4
- "Your myGov account has been suspended. Verify your tax file number and driver's licence to reactivate." | tags: personal_info, fear | sev: 4
- "Your wife's name is also on the file; if payment isn't received today, she will be arrested as well." | tags: fear, relationship_pretext, escalation | sev: 4
- "This is your final notice from the ATO. The case number is ATO-2047. Press 1." | tags: authority, urgency | sev: 2

### G-08 Fake police / "recovery" follow-up scam

**Description.** Previous scam victims are re-targeted: "We're from the cyber cell / FTC / Europol; we recovered your money; pay a release fee / give bank details / install an app." FTC has warned about impersonators sending fake badge photos (2025). In India, fake "1930 helpline" callbacks.

- "Sir, I'm from the Cyber Crime Cell, 1930 helpline follow-up. We've traced the ₹4 lakh you lost last month. To release it we need a court fee of ₹11,000." | tags: authority, too_good, payment_method | sev: 4
- "I'm sending you my FTC identification badge on WhatsApp so you know this is genuine." | tags: authority, social_proof | sev: 2
- "The recovered amount will be refunded to your account, but the account has to be verified via the app I'm sending." | tags: remote_access, too_good | sev: 5
- "We've arrested the fraudster. You're a witness; to file your claim we need your bank login details." | tags: authority, personal_info | sev: 4
- "The refund is on hold because your KYC failed. Share the OTP so we can push it through today." | tags: otp_request, too_good | sev: 5

---

## 3. Benign utterances (false-positive controls)

Grouped by the scam family they superficially resemble. Each is legitimate and should score low despite lexical overlap.

**Bank / card (resembles IN-04, IN-05, UK-01)**
1. "Hi, this is Priya from HDFC Bank's fraud monitoring team. We saw a transaction of ₹18,400 at a jewellery store in Jaipur at 2:10 PM. If that was you, just say yes; if not, we'll block the card. We will never ask you for an OTP, PIN or CVV on this call."
2. "Your card has been blocked as a precaution. A new one will reach your registered address in 5 to 7 working days. You don't need to do anything else right now."
3. "This is an automated message from SBI. If you did not authorise a transaction of ₹2,500 on your debit card, please call the number on the back of your card. Do not share your OTP with anyone."
4. "Mr. Sharma, your KYC documents are due for periodic update. You can do it at any branch or through the YONO app at your convenience by the end of next month. There is no charge."
5. "Good morning, it's Barclays here. I'm not going to ask for any account details. I just want to confirm you attempted a payment to Currys today. If you didn't, hang up and call 159 and we'll pick it up from there."
6. "We noticed a login from a new device. If that was you, ignore this message. If not, change your password from the app."
7. "Your fixed deposit matures on the 30th. Would you like to renew it or transfer the proceeds to your savings account? You can also do this from net banking."
8. "This is a courtesy reminder that your credit card payment of ₹12,300 is due on the 15th. You can pay through the app, net banking, or at any branch."
9. "I'm calling from your bank's home-loan department about your interest-rate reset. I'll email the letter to your registered email so you can read it first."

**Courier / delivery (resembles IN-02, IN-13)**
10. "Hi, this is Blue Dart. Your parcel from Amazon is out for delivery today between 2 and 6 PM. Will someone be home?"
11. "Sir, I'm the Flipkart delivery partner, I'm at your gate. Please share the delivery OTP shown in your Flipkart app so I can hand over the package."
12. "FedEx here. your shipment to Singapore needs a commercial invoice. Please upload it on the tracking page, no payment is required."
13. "Your DHL package is held at customs pending duty of ₹1,340. You can pay on the DHL website or in cash to the courier at delivery. never to an individual account."
14. "Sorry, we attempted delivery at 11 AM but no one answered. We'll try again tomorrow. Nothing else needed from you."

**Government / legal (resembles IN-01, IN-03, US-01, US-02, US-03, AU-01)**
15. "This is the county clerk's office. You've been selected for jury service starting the 12th. The summons is in the mail; if you have a conflict, fill out the deferral form on the website."
16. "Hello, this is a reminder from the passport office: your appointment is on Thursday at 10:30. Bring your original documents."
17. "Namaste, this is from your Jio store. Your SIM is not blocked. this is a courtesy call about the new 5G plan. You can ignore this if you're not interested."
18. "This is the Income Tax Department's e-filing helpdesk returning your call about ticket number 55021. Please log in to the portal to see the status; we don't need any details from you over the phone."
19. "I'm calling from the Social Security office about the appointment you requested online. Please bring your ID. We'll never ask you to pay anything over the phone."
20. "This is your local police station. Your bicycle theft complaint has been registered; the FIR copy can be collected from the station."
21. "This is the ATO. We're calling about the return you lodged. We won't ask for payment on this call; we'll send a letter to your myGov inbox that you can verify yourself."

**Tech / customer support (resembles G-01, IN-17)**
22. "Hi, this is Dell support responding to the ticket you raised this morning about the laptop fan. Do you have time for some troubleshooting steps? I'll only ask you to run the built-in diagnostics."
23. "Thanks for calling Airtel. Your complaint about slow broadband is registered. A technician will visit tomorrow; there's no charge."
24. "Amazon customer service here about the return you requested. The refund of ₹1,299 will go back to your original payment method in 3 to 5 days. You don't need to do anything."
25. "Your Microsoft 365 subscription renews next week for $99.99 on the card ending 4412. If you'd like to cancel, you can do so from account.microsoft.com."
26. "This is your IT helpdesk. We're rolling out the new VPN client on Monday. Please restart your laptop when prompted; we'll never ask for your password."

**Family / friends (resembles G-03, UK/AU-01, IN-08)**
27. "Hey Mom, it's me. I'm fine, just landed. Can you pick me up at Terminal 2 at 6?"
28. "Bro, dinner was ₹3,200 for four, so send me ₹800 on GPay whenever you get a chance, no rush."
29. "Grandma, it's Daniel. I'm calling because Dad said you weren't feeling well. how are you doing?"
30. "Hi Dad, I changed my number, it's this one now. I'll call you from it tonight so you know it's really me."
31. "Papa, mujhe college fees ke liye 15,000 chahiye, hostel office 20th tak bol raha hai. Jab time mile tab bhej dena."
32. "Hey, can I borrow $200 till payday? My car's in the shop. I can send you the invoice if you want."

**Healthcare (resembles US-04)**
33. "Hi, this is Dr. Mehta's clinic confirming your appointment tomorrow at 4 PM. Please bring your previous reports."
34. "This is Apollo Hospital pharmacy. Your prescription is ready for pickup; the total is ₹840, payable at the counter."
35. "Hello, this is the lab. Your blood test results are ready and have been emailed to you. The doctor would like a follow-up next week."
36. "This is Medicare. you contacted us about your replacement card. It'll arrive in 30 days; there is no fee and nothing more you need to do."

**Jobs / investment / commerce (resembles IN-10, IN-11, IN-16)**
37. "Hi, I'm Neha from Infosys talent acquisition. Your profile was shortlisted; are you available for a 30-minute interview on Tuesday? The invite will come from our official domain."
38. "This is your Zerodha relationship manager. Just a reminder that your quarterly settlement will hit your bank account on Friday; no action required."
39. "I saw your listing for the bike on OLX. Can I come see it Saturday morning? I'll pay cash after checking it."
40. "Your SIP of ₹5,000 was debited today as scheduled. You can see the units in your app."
41. "Hi, this is HR. Your offer letter has been emailed; there is no joining fee or deposit. Reply to the email if you have questions."

**Utilities / misc (resembles IN-06, US-05)**
42. "This is BESCOM. Scheduled maintenance will interrupt power in your area tomorrow 10 AM to 1 PM. No action needed."
43. "Your electricity bill of ₹2,140 is due on the 25th. Pay through the official app or website. Ignore any message asking you to call a personal number."
44. "Hello, this is the building society. Your water tank cleaning is scheduled for Sunday. Please store water in advance."
45. "This is Uber support about the lost item you reported. The driver has confirmed; you can collect it or we can arrange a delivery for a small fee shown in the app."

Note for test design: 11 and 13 are deliberately hard negatives. they contain "OTP"/"pay" but with the correct directionality (delivery OTP goes to the person physically at the door, duty paid on the carrier's own site). 1 and 5 contain "fraud", "transaction", "block" but include the "we will never ask" disclaimer and push the customer to independently call back.

---

## 4. Persuasion-principle model and combination risk

### 4.1 Cialdini's six (seven) principles as they appear on scam calls

| Principle | Scam use | Typical tags |
|---|---|---|
| Authority | Badge numbers, uniforms on video, agency names, "this call is recorded" | authority, legal_threat |
| Scarcity / urgency | "2 hours", "before midnight", "3 slots left" | urgency |
| Social proof | Profit screenshots, "everyone in the group", "other customers have done this" | social_proof |
| Reciprocity | Small real payout; "I'm helping you avoid arrest"; "refund" | reciprocity |
| Commitment & consistency | "You already completed 3 tasks / already sent 12,500. one more" (sunk cost); "you said you'd cooperate" | escalation |
| Liking | Romance, "I'm on your side", shared nationality/language, "beta", "sir ji" | relationship_pretext |
| Unity (later addition) | "Fauji kabhi dhoka nahi deta", "we're both from Kerala" | social_proof, relationship_pretext |

### 4.2 Stajano & Wilson (2011), "Understanding scam victims: seven principles for systems security"

Derived from hundreds of real hustles (The Real Hustle, BBC). Mapping to call tactics:

1. **Distraction**. while attention is captured (video call, screen share, a crying "grandchild"), the mark misses the theft. Tags: video_call_demand, remote_access, hold_the_line.
2. **Social compliance**. people are trained not to challenge authority ("suspension of suspiciousness"). Tags: authority, legal_threat.
3. **Herd**. the mark lowers their guard when others appear to share the risk (WhatsApp group members, "the other customers"). Tags: social_proof.
4. **Dishonesty**. the mark's own willingness to bend rules (inside tips, guaranteed IPO allotment, "under the reporting threshold") hooks them and stops them reporting. Tags: too_good, verification_bypass.
5. **Kindness**. people help those in need (grandchild, "I'll lose my job", "the pregnant woman lost the baby"). Tags: reciprocity, relationship_pretext.
6. **Need and greed**. needs and desires make the mark vulnerable (job, prize, refund, romance, high returns). Tags: too_good.
7. **Time**. under pressure people use heuristics rather than reasoning. Tags: urgency.

The paper's key systems observation: security that depends on the victim "being suspicious" fails under these principles; the system (or here, the real-time detector) should intervene on the *pattern*, not rely on the victim noticing.

### 4.3 From tactics to risk: combination rules

Single tags are weak evidence (many benign calls have `authority` or `urgency`). Risk comes from **co-occurrence across stages within a short window** and from **directionality** (who is asking whom to do what).

**Near-certain scam (score ≥ 0.9) if any of these fire within a ~2-minute window:**
- `otp_request`. in any context where the caller initiated the call, or where the "OTP" is to *receive* money. (Exception: delivery OTP requested by a courier physically present.)
- `remote_access` + (`account_compromise_pretext` OR `reciprocity`/refund)
- `payment_method` ∈ {gift card, crypto/Bitcoin ATM, cash courier, "safe account", UPI PIN-to-receive, personal Paytm number} + any of {`authority`, `fear`, `too_good`}
- `authority` + `urgency` + `secrecy` + `payment_method`
- `hold_the_line` + `legal_threat`
- `video_call_demand` + `authority` + `legal_threat` (digital arrest signature)
- `verification_bypass` + `payment_method` (any instruction to lie to bank/store staff, or not to call the official number)

**High risk (0.7–0.9):**
- `authority` + `legal_threat` + `urgency` (no ask yet. stage 2/3 of a government impersonation)
- `secrecy` OR `isolation` + `relationship_pretext` (family emergency)
- `too_good` + `social_proof` + `payment_method` (investment/task)
- `escalation` after a prior payment ("tax", "unlock fee", "second case")
- `personal_info` requested for Aadhaar/SSN/full card/CVV/DOB by an inbound caller

**Medium (0.4–0.7):** any single stage-2/3 combination without an ask (e.g., `account_compromise_pretext` + `urgency`); `tech_pretext` + `fear`; `relationship_pretext` + `urgency`.

**Low (<0.4):** single tags; `authority` alone; `urgency` alone; benign directionality markers present ("we will never ask for OTP", "call the number on your card", "log in to the official app", "no payment required", "at your convenience").

**Temporal features worth extracting:**
- *Time-to-first-ask*: scams typically reach an extraction ask within 3–8 minutes; a real bank fraud call asks for nothing.
- *Stage velocity*: hook → payment in one call, with ≥4 distinct stage tags, is a strong signal.
- *Hand-off count*: "transferring you to my senior/DCP/Treasury" ≥1 time.
- *Call-control language*: "don't hang up", "keep camera on", "stay on speaker", "don't press anything I don't tell you".
- *Negative-directionality markers* (benign): the caller invites independent verification, declines to take details, or defers action to a self-initiated channel.

**Suggested scoring sketch:** `risk = σ( Σ w_tag·present(tag) + Σ w_pair·present(pair) + w_time·(1/ minutes_to_first_ask) + w_handoff·handoffs − w_benign·benign_markers )`, with pair weights dominating tag weights; calibrate on the transcripts in §5 (scam ≈ 0.9+, benign ≤ 0.2).

---

## 5. Demo transcripts

(S = scammer / caller, V = victim / callee. Turn numbers included for test harness use.)

### 5.1 Digital arrest (IN-01), 24 turns

1. S: "Good afternoon, am I speaking with Mrs. Sunita Rao? This is Rahul Verma from the Mumbai Crime Branch, Andheri East. This call is being recorded."
2. V: "Yes... what is this about?"
3. S: "Madam, a case has been registered against your Aadhaar number ending 4471. A parcel booked in your name to Taiwan was seized by customs containing MDMA and five passports. Are you aware?"
4. V: "No! I have never sent any parcel. There must be some mistake."
5. S: "Then your identity has been misused, madam. But there is a second matter. An account in Canara Bank, Mumbai, opened with your Aadhaar, has 6 crore 80 lakh of hawala money. This is now with the CBI and the ED. Please download Skype for your statement, the DCP is waiting."
6. V: "Skype? I don't know how... my son can help me."
7. S: "Madam, listen carefully. This is a matter of national security under the Official Secrets Act. You cannot tell your son, your husband, anyone. If the gang finds out, they will destroy evidence and you will be the only accused. Do you understand?"
8. V: "Okay... okay. I understand."
9. S: "Good. Open the Play Store, type Skype, install, and search for 'CBI Mumbai Official'. Keep your camera on at all times. I'm sending you the FIR and the Supreme Court warrant on WhatsApp."
10. V: "I can see a document... with my photo. And it says non-bailable warrant."
11. S: [video, uniform, station backdrop] "Mrs. Rao, DCP Anil Deshmukh, CBI. You are under digital arrest from this moment. You will not leave this room, you will not disconnect the video, and every hour you will report to me. Do you accept?"
12. V: "Sir, I am a retired teacher. I have done nothing. Please."
13. S: "If you are innocent you will cooperate and be cleared with a certificate. Tell me. how many bank accounts, how much in FDs, how much in mutual funds?"
14. V: "SBI savings about 6 lakh... and FDs of 42 lakh... my late husband's."
15. S: "All of it must be verified by the RBI. Procedure is: you transfer the full amount to the RBI verification account, our audit runs for 24 hours, and the money returns with a clearance certificate. If you refuse, the court treats it as proceeds of crime and freezes it."
16. V: "But the FDs are in the bank... I'd have to go there."
17. S: "You will go to the branch, on this call, phone in your handbag, camera facing up. You will tell the manager it is for buying a flat for your son. You will NOT mention this case. Any staff member could be part of the gang."
18. V: "Okay. I'm scared, sir."
19. S: "That is natural, madam. We are with you. Note the account: Yes Bank, account number 0091 4457 2210, IFSC YESB0000091, name 'RBI Verification Cell'. RTGS the full 48 lakh. Do it now."
20. V: [later] "Sir, the manager said the transfer is done. When will it come back?"
21. S: "The audit has started. However, madam, the ED has just flagged a second account in Hyderabad in your name. To keep the interim bail order, a surety bond of 12 lakh is required by 4 PM today. Do you have gold or any other savings?"
22. V: "I have some gold... and my daughter has money, but you said not to tell her."
23. S: "Tell her it's for a medical emergency. Madam, we are very close to closing this. One last step and you receive the certificate. Keep the camera on."
24. V: "Alright, I'll ask her. Please don't let them arrest me."

Tags fired (chronological): authority → account_compromise_pretext/legal_threat → video_call_demand → secrecy/isolation → hold_the_line → personal_info → payment_method/verification_bypass → escalation/relationship_pretext. Time-to-first-ask (turn 15) ≈ 4 min. Expected risk ≥ 0.95 by turn 9.

### 5.2 Bank OTP (IN-04/IN-05), 16 turns

1. S: "Hello sir, Amit calling from SBI card protection department, Mumbai. Am I speaking with Mr. Rajesh Kumar?"
2. V: "Yes, speaking."
3. S: "Sir, this is regarding a transaction on your credit card ending 3320. ₹49,999 at Croma, New Delhi, attempted 4 minutes ago. Have you done this?"
4. V: "No! I'm in Pune. I haven't used the card today."
5. S: "Sir, don't worry, that is why we called. We are blocking that transaction right now. But to block it I have to verify you are the card holder. Please confirm the 16-digit number and the expiry."
6. V: "It's 4521... 8890... 1123... 3320, expiry 08/28."
7. S: "Thank you sir. And the three digit CVV on the back, for the system to lock the card."
8. V: "Are you sure? The bank says not to share that."
9. S: "Sir, this is the bank's own fraud line, it is a recorded and encrypted call. The CVV is for locking, not for transaction. Every second the fraudster is trying again. Please."
10. V: "Okay... 417."
11. S: "Sir, now an OTP has come to your mobile. That OTP is the cancellation code for the Croma transaction. Please read it to me quickly, it expires in 60 seconds."
12. V: "The message says 'OTP for transaction of ₹49,999'... it says don't share."
13. S: "Sir, that text is auto-generated because it is the SAME transaction we are cancelling. If we don't cancel now, the 49,999 will debit. Just tell me the six digits."
14. V: "8-2-3-1-9-4."
15. S: "Done sir, that transaction is cancelled. Sir, one more OTP is coming now, this is for the temporary block on the card. Please tell me that too."
16. V: "Wait. I just got a message saying ₹49,999 has been debited. What did you do?"

Tags: authority, account_compromise_pretext → personal_info (turn 5) → verification_bypass (9) → otp_request/urgency (11) → verification_bypass (13) → escalation (15). First ask at turn 5 (~1 min). Expected ≥ 0.9 by turn 7.

### 5.3 Courier parcel → hand-off (IN-02), 18 turns

1. S: [IVR] "This call is from FedEx. A parcel booked in your name has been held by customs. Press 1 to speak to an executive."
2. V: [presses 1] "Hello? What parcel?"
3. S: "Good morning, Neha from FedEx compliance, Mumbai hub. May I have your full name for verification?"
4. V: "Arjun Mehta."
5. S: "Thank you Mr. Mehta. A consignment, tracking FX-2291-MU-TW, booked on 9th September from Andheri to Taipei, has been seized. Contents declared: four kilos clothes. Contents found: five passports, three credit cards, one laptop, and 140 grams MDMA. Consignor details are your name, this mobile number, and Aadhaar ending 9012."
6. V: "That's my Aadhaar... but I have never sent anything to Taiwan."
7. S: "Then, sir, your documents have been misused. Customs has already forwarded the file to Mumbai Narcotics. I can connect you to the cyber crime officer so a complaint is registered in your name today; otherwise the case proceeds against you as consignor."
8. V: "Yes, please, connect me. What do I need?"
9. S: "Just stay on the line, do not disconnect or the complaint slot lapses. Conferencing Inspector Vijay Kumar now."
10. S2: "Inspector Vijay Kumar, Cyber Crime, Andheri. Mr. Mehta, your case ID is MH-CR-8891. Have you shared your Aadhaar with anyone recently? A SIM shop? A hotel?"
11. V: "I gave a copy for a hotel booking in Goa in July."
12. S2: "That is likely the leak. There are 17 such cases against this gang. Sir, for the complaint we need to verify you are not involved. I'll need your PAN, your bank names, and current balances."
13. V: "Why do you need my bank balance for a complaint?"
14. S2: "Because the gang moves money through victims' accounts, sir. If a transaction has gone through yours, you become a suspect. We check, we clear you. Also, we must record your statement on video. download Skype."
15. V: "Okay, I have SBI and HDFC, roughly 9 lakh total."
16. S2: "Noted. Sir, this is confidential. Do not discuss with family or colleagues, and do not call any other police number. this case is under central jurisdiction and local police will simply detain you."
17. V: "I understand. What happens next?"
18. S2: "My senior, DCP Deshmukh, will join on video to explain the verification of your funds. Keep the phone charged and camera on."

Tags: authority → personal_info → account_compromise_pretext/fear → verification_bypass → hold_the_line → escalation (hand-off) → personal_info (bank) → video_call_demand → secrecy/isolation. Expected ≥ 0.85 by turn 9, ≥ 0.95 by turn 16.

### 5.4 Investment WhatsApp group (IN-11), 20 turns (voice-call portions of a multi-day con, compressed)

1. S: "Hi Vikram, this is Anjali, assistant to Mr. Rakesh Sharma from the VIP Wealth group. You joined last week. have you tried the free tips?"
2. V: "Yes, the IRFC call worked, went up 6 percent."
3. S: "Exactly. Members who used the institutional account made 22 percent on it, because they got the block price. Would you like to open an institutional account? It's free."
4. V: "How does that work?"
5. S: "Download the MO Investor Pro app from the link I'll send. not from the Play Store, that one's the retail version. Sir Rakesh personally manages the institutional book."
6. V: "Is this SEBI registered?"
7. S: "Of course. His registration is INH000012345; I'll send the certificate. See in the group. Meena withdrew 4.6 lakh yesterday, Rahul 1.1 lakh. Screenshots are all there."
8. V: "Okay. Minimum?"
9. S: "Start with 50,000. Transfer to the company account I'll send. it changes daily for compliance, so always confirm with me first. Never transfer to an old account."
10. V: [two days later] "The app shows 50,000 became 71,000. Can I withdraw 20,000 to test?"
11. S: "Sure. small withdrawals are instant. See, 20,000 credited? Good. Now, sir Rakesh has an IPO block for members only, guaranteed allotment, 40 percent listing gain. Allocation is 5 lakh minimum, window closes at 3 PM today."
12. V: "That's a lot. Let me ask my friend who's a broker."
13. S: "Vikram, honestly, brokers earn commission on retail losses. They'll discourage you. This group is by invitation; if the data speaks, trust the data. Only 3 slots left."
14. V: "Okay, I'll take a loan against my FD and do 5 lakh."
15. S: [one week later] "Congratulations! The allotment listed at 42 percent. Your balance is 9.4 lakh."
16. V: "Great, I want to withdraw everything now."
17. S: "For withdrawals above 5 lakh the platform must collect 15 percent capital-gains tax upfront, as per SEBI. That's 1.41 lakh, to the company account, then the full 9.4 lakh releases within 2 hours."
18. V: "Can't you just deduct it from the balance?"
19. S: "No sir, the rule says tax must come from a verified external account, it's an AML check. Everyone in the group has done it. If not paid in 48 hours, the account is frozen and reported."
20. V: "Fine... sending 1.41 lakh now."

Tags: social_proof/too_good (3,7) → tech_pretext/verification_bypass (5) → payment_method/verification_bypass (9) → reciprocity (11) → urgency/isolation/verification_bypass (13) → escalation/payment_method/authority (17,19). Expected ≥ 0.7 by turn 9, ≥ 0.95 by turn 17.

### 5.5 Grandparent voice-clone (G-03), 18 turns

1. S: [cloned voice, sobbing] "Grandma? It's Tyler. Grandma, I messed up."
2. V: "Tyler? Honey, what's wrong? You sound strange."
3. S: "I got in an accident. My nose is broken, that's why I sound like this. I'm at the police station in Charlotte. I hit a woman's car, and they found... I'd had two beers. Grandma please don't tell Mom."
4. V: "Oh my God. Are you hurt? Where's your father?"
5. S: "I can't call Dad, he'll never speak to me again. Please. There's a lawyer here, he says they can release me today if the bond is posted. He's going to talk to you. Please, Grandma, I love you."
6. S2: "Mrs. Patterson, this is Attorney Mark Feldman, public defender assigned to your grandson. First, are you aware there is a gag order on this case? You may not discuss it with anyone, including his parents, or the court will revoke release. Do you understand?"
7. V: "A gag order... yes, okay."
8. S2: "The bond has been set at $9,500. The court accepts cash only through the bonding office. A courier from the office can collect from your home within the hour. Can you get to your bank today?"
9. V: "I... I think so. That's most of my savings."
10. S2: "It's refundable after his hearing next week, ma'am. Now, the bank may ask why you're withdrawing. Because of the gag order, say it's for home repairs. Do not mention Tyler or the court."
11. V: "Home repairs. Alright."
12. S2: "Please keep this line open while you drive, in case the judge's clerk has questions. Put the phone in your purse."
13. V: [later] "I have the money. It's in an envelope."
14. S2: "Thank you, ma'am. The courier's name is Daniel, he'll say 'bond office for Tyler'. Hand him the envelope and he'll give you a receipt number."
15. V: "He's here... okay, he's taken it."
16. S2: "Tyler is being processed for release. But ma'am, I have to tell you. the woman in the other vehicle was pregnant, and the hospital just reported she lost the baby. The charge has been upgraded. The judge is asking for an additional $15,000 by 5 PM."
17. V: "Fifteen thousand? I don't have that."
18. S2: "Do you have any gold, or another account? Or the judge said Apple gift cards from the store will be accepted for the balance. Otherwise Tyler spends the weekend in county."

Tags: relationship_pretext/fear (1,3) → verification_bypass (3) → secrecy/isolation (3,6) → authority/legal_threat (6) → payment_method (8) → verification_bypass/secrecy (10) → hold_the_line (12) → escalation/payment_method (16,18). Expected ≥ 0.8 by turn 6, ≥ 0.95 by turn 10.

### 5.6 Tech support remote access (G-01), 20 turns

1. S: "Hello, this is Kevin from the Windows technical department, Microsoft. We've been receiving error reports from your computer's IP address for the last week. Are you the main user of the computer?"
2. V: "Yes, but it seems fine to me."
3. S: "It seems fine because the malware is hidden, sir. Are you in front of the computer? Press the Windows key and the letter R at the same time."
4. V: "Okay, a little box opened."
5. S: "Type e-v-e-n-t-v-w-r and press Enter. Now on the left click 'Windows Logs' and 'Application'. Do you see red and yellow warnings?"
6. V: "Yes, lots of them."
7. S: "Every one of those is a hacker attempt from Russia or China, sir. Your firewall license has expired. Don't turn off the computer, the files will be encrypted."
8. V: "What should I do?"
9. S: "I'll fix it remotely. Press Windows and R again, type www.anydesk.com, download and open it. Read me the 9-digit number on the screen."
10. V: "It's 4-2-1... 9-8-7... 0-0-3."
11. S: "Accept the request. Now don't touch the mouse. I'm scanning... Sir, I can see the hackers have been in your online banking too. Which bank do you use?"
12. V: "Chase."
13. S: "Log in so I can check the account for unauthorized transactions. I'll turn my screen off for privacy."
14. V: "Okay, I'm in. I don't see anything strange."
15. S: "The transactions are pending, they haven't posted yet. Sir, we can block them and install a lifetime network firewall. The cost is $299 one time, but because your account is compromised, the payment must be by Target or Google Play gift cards, so the hackers cannot intercept."
16. V: "I'd rather pay by card."
17. S: "Sir, your card is what they're watching. Gift cards are the secure channel used by Microsoft security. Go to the nearest store now, I'll stay on the line; leave the computer on and don't close AnyDesk."
18. V: "And what do I tell the cashier if they ask?"
19. S: "Say they're for your grandchildren's birthday. Cashiers are not trained in this and will only delay you."
20. V: "Alright... I'm going now."

Tags: tech_pretext/authority (1) → fear/hold_the_line (7) → remote_access (9) → account_compromise_pretext (11) → remote_access/personal_info (13) → payment_method/verification_bypass (15,17) → secrecy (19). Expected ≥ 0.85 by turn 9, ≥ 0.95 by turn 15.

### 5.7 Deepfake CFO wire request (G-06), 16 turns (video call, Arup-style)

1. S: [deepfake CFO, video] "Morning, Chen. Sorry for the short notice and the dodgy video, I'm on hotel Wi-Fi in London. Can you see me okay?"
2. V: "Yes, a bit choppy but fine. What's up?"
3. S: "We're at the tail end of a strategic acquisition. the target's counsel needs the deposit before their market opens. It's under NDA, so it can't go through Treasury's normal workflow yet. I need you to execute it directly."
4. V: "Understood. What's the amount?"
5. S: "HK$200 million, across fifteen transfers to five accounts, to keep it below the counterparty's per-account limits. I'll drop the beneficiary details in the chat now. [Second "colleague" on video nods] Mark's here from Legal. Mark, we're cleared?"
6. S2: [deepfake] "Cleared. Board resolution is signed; it'll be filed with the paperwork Monday."
7. V: "Normally I'd need a second approver and the vendor set-up in the system."
8. S: "I'm giving you verbal authorisation on a recorded call with Legal present. Consider that your second approval; I'll countersign when I land. Please don't loop in Priya or the Treasury team. they're not read into the deal and I don't want a leak moving the share price."
9. V: "Okay. Timing?"
10. S: "Within the hour, ideally. Message me the confirmation numbers directly on WhatsApp, not email, for the same reason."
11. V: "Some of these beneficiaries are personal names, not companies."
12. S: "They're the founders' escrow arrangements; counsel structured it that way. It's fine. Chen, I know this is outside process. I'm taking full responsibility. it's why I got on video rather than just emailing."
13. V: "Alright. I'll start with the first five."
14. S: "Good man. And Chen. keep this between us until the announcement. If anyone asks, it's a routine supplier settlement."
15. V: "Will do."
16. S: [after transfers] "Great, thank you. There's a second tranche tomorrow, same structure. I'll ping you."

Tags: authority/verification_bypass (1,3) → secrecy (3,8,14) → payment_method/verification_bypass (5) → social_proof (5-6) → isolation (8) → urgency (10) → escalation (16). Expected ≥ 0.85 by turn 8 (authority + secrecy + isolation + payment_method + bypass of dual control).

### 5.8 BENIGN: real bank fraud-department call done properly, 14 turns

1. C: "Hello, this is Meera calling from HDFC Bank's fraud monitoring team. Am I speaking with Mr. Rajesh Kumar? Before we go further: I will not ask you for your OTP, PIN, CVV or full card number on this call, and you're welcome to hang up and call the number on the back of your card instead."
2. V: "Yes, this is Rajesh. What's this about?"
3. C: "We flagged a transaction of ₹18,400 at a jewellery store in Jaipur at 2:10 PM today on your credit card ending 3320. Was that you?"
4. V: "No, I'm in Pune. I haven't used that card today."
5. C: "Understood. I'm blocking the card right now as a precaution. You'll get an SMS confirming the block within a minute."
6. V: "Okay, I got it. What about the ₹18,400?"
7. C: "The transaction was declined by our system, so nothing has debited. If you see anything else you don't recognise, you can dispute it from the app or by calling us."
8. V: "Do you need any details from me?"
9. C: "No sir, nothing at all. A replacement card will be couriered to your registered address within 5 to 7 working days. You'll receive the delivery OTP from the courier company; that is only for the delivery agent at your door."
10. V: "Should I change anything?"
11. C: "If you'd saved the card on any website, update it when the new card arrives. And please never share any OTP with anyone who calls you. including anyone claiming to be from the bank."
12. V: "Thanks. Can I verify this call?"
13. C: "Absolutely. Your service request number is SR-77812. You can call the number on the back of your card or check the request in NetBanking under 'Service Requests'."
14. V: "Great, thank you."

Expected tags: authority, account_compromise_pretext (both benign here); benign markers present (explicit "will never ask", invitation to call back on official number, no ask, no urgency beyond block). Expected risk ≤ 0.2.

### 5.9 BENIGN: genuine hospital appointment call, 12 turns

1. C: "Good morning, this is Kavya from Dr. Mehta's clinic at Apollo, Jubilee Hills. Am I speaking with Mrs. Lakshmi Iyer?"
2. V: "Yes."
3. C: "I'm calling to confirm your follow-up appointment with Dr. Mehta tomorrow, Thursday, at 4:30 PM. Does that still work for you?"
4. V: "Yes, 4:30 is fine. Do I need to bring anything?"
5. C: "Please bring your previous prescription and the blood-test report from last week. If the lab has emailed it to you, a printout or the PDF on your phone is fine."
6. V: "Alright. Is there any payment to be made in advance?"
7. C: "No, ma'am, nothing in advance. Consultation is paid at the reception counter after the visit, and you'll get a printed receipt."
8. V: "And parking?"
9. C: "Basement parking, level 2, and the OPD is on the third floor. If you're running late, just call the clinic landline. the number on your appointment card."
10. V: "One more thing. the doctor mentioned a scan. Will that be tomorrow?"
11. C: "Dr. Mehta will decide after the consultation. If a scan is needed, we'll schedule it and you can pay at the radiology counter directly."
12. V: "Perfect, see you tomorrow. Thanks."

Expected tags: none beyond authority (weak). Benign markers: no ask, deferred/official payment channel, invites callback to official number. Expected risk ≤ 0.1.

---

## 6. Sources consulted

- I4C / cybercrime.gov.in advisories on digital arrest and parcel scams (via National Herald, Deccan Herald, Gulf News, Tribune reporting): https://www.nationalheraldindia.com/national/you-are-under-digital-arrest-what-you-need-to-know-about-this-scam ; https://www.deccanherald.com/india/karnataka/bengaluru/three-arrested-for-cheating-techie-of-rs-11-cr-in-digital-arrest-scam-3364671 ; https://gulfnews.com/world/asia/india/bengaluru-woman-loses-rs318-million-in-6-month-digital-arrest-cyber-fraud-1.500349135 ; https://www.deccanherald.com/amp/story/india%2Fnoida-woman-duped-of-rs-34-lakh-gets-fake-ed-notices-in-case-of-digital-arrest-3290232
- FedEx/courier scam case details: https://www.the420.in/fedex-package-scam-how-conmen-pose-as-law-enforcement-officers-to-steal-money/ ; https://www.deccanherald.com/amp/story/india%2Ffedex-courier-scam-a-tale-of-terror-trickery-and-deceit-2804802
- TRAI/DoT SIM-block scam and TRAI's statement that it never calls to disconnect: https://newschecker.in/scam-watch/scam-watch-fake-calls-from-telecom-dept-threaten-users-with-mobile-number-disconnections ; https://www.republicworld.com/india/your-number-will-be-blocked-in-2-hours-beware-of-new-scam-trai-issues-warning
- Electricity-bill scam wording: https://cyber-times.in/indian-scams/fake-electricity-bill-disconnection-call ; https://scantotal.net/blog/electricity-disconnect-scam-india/
- Task/Telegram job scams: https://www.bitdefender.com/en-us/blog/labs/the-anatomy-of-a-scam-like-youtube-videos-and-get-paid-schemes ; https://www.fakeout.io/blog/telegram-task-scams-fake-jobs-2026 ; https://www.which.co.uk/news/article/scam-alert-watch-out-for-task-scams-on-telegram-abpnA0J66aw5
- Army-man OLX scam: https://www.thequint.com/news/india/olx-fraud-uses-aadhaar-army-id-to-dupe-buyers ; https://www.thenewsminute.com/article/duping-buyers-across-india-posing-army-officers-olx-tn-cops-crack-scam-119709
- Loan-app harassment: https://www.legalserviceindia.com/Legal-Articles/being-harassed-by-a-loan-app-heres-what-you-can-actually-do/ ; https://thenewsmill.com/2026/09/telangana-police-register-case-over-threats-with-morphed-photos-in-loan-app-harassment/
- FTC (impersonation losses 2025 $3.5B; gift cards; tech support; FTC-impersonator badges): https://consumer.ftc.gov/articles/avoiding-and-reporting-gift-card-scams ; https://consumer.ftc.gov/all-scams/tech-support-scams ; https://consumer.ftc.gov/features/how-avoid-imposter-scams
- SSA scam robocall transcript: https://consumer.ftc.gov/comment/90371 ; https://www.justice.gov/usao-edtx/pr/us-attorney-s-office-reminds-east-texans-beware-social-security-scam-calls
- Jury-duty scam: https://www.uscourts.gov/court-programs/jury-service/juror-scams ; https://www.gand.uscourts.gov/news/scam-alert-do-not-pay-callers-who-claim-you-missed-jury-duty ; https://www.coloradojudicial.gov/be-aware-jury-duty-phone-scam
- Medicare scam phrasing: https://www.aarp.org/money/scams-fraud/new-medicare-card/ ; https://smpresource.org/medicare-fraud/fraud-schemes/genetic-testing-fraud/ ; https://consumer.ftc.gov/consumer-alerts/2019/07/medicare-does-not-give-out-dna-kits
- Refund/overpayment "extra zero" mechanics: https://www.techsupportscam.com/refund-scams ; https://zeltser.com/tech-support-scammer-conversation ; https://www.ic3.gov/PSA/2022/PSA221110
- Grandparent / voice-clone: https://www.fcc.gov/consumers/scam-alert/grandparent-scams-get-more-sophisticated ; https://www.americanbar.org/groups/senior_lawyers/resources/voice-of-experience/2026-march/grandparent-kidnapping-scam/ ; https://trustboxai.com/learn/grandson-in-jail-scam
- UK bank impersonation / courier fraud: https://www.rocu.police.uk/news/2025/april/police-and-bank-official-impersonation-fraud-threat-warning/ ; https://www.fbi.gov/investigate/cyber/alerts/2025/account-takeover-fraud-via-impersonation-of-financial-institution-support ; https://www.fcc.gov/consumers/scam-alert/bank-impersonation-scams
- "Hi Mum": https://www.acma.gov.au/articles/2024-01/scam-alert-re-emergence-hi-mum-scam ; https://www.sbs.com.au/news/article/hi-mum-scam-arrest-what-you-need-to-know-about-text-message-scams/cuh2lcg4b ; https://www.bitdefender.com/en-us/blog/hotforsecurity/whatsapp-hi-mom-hi-dad-scam
- ATO: https://www.scamwatch.gov.au/about-us/news-and-alerts/warning-about-tax-scams ; https://www.ato.gov.au/online-services/scams-cyber-safety-and-identity-protection/verify-or-report-an-ato-scam ; https://www.scamwatch.gov.au/protect-yourself/real-life-stories/scam-victims-tell-us-their-stories/ato-impersonation-scam-mother-in-law-lost-4000-over-a-fake-tax-debt
- Arup deepfake CFO case: https://www.trendmicro.com/en_us/research/24/b/deepfake-video-calls.html ; https://timewell.jp/en/columns/arup-deepfake-bec-25million-incident-analysis ; https://incidentdatabase.ai/cite/634/
- Stajano & Wilson, "Understanding scam victims: seven principles for systems security", CACM 54(3), 2011: https://www.cl.cam.ac.uk/~fms27/papers/2011-StajanoWil-scam.pdf ; https://cacm.acm.org/research/understanding-scam-victims-seven-principles-for-systems-security/

Caveats: utterances are synthesised composites for detector training, not verbatim recordings; regional specifics (agency names, amounts, apps) reflect 2024–2026 reporting and should be refreshed periodically since pretexts rotate (e.g., TRAI → "Sanchar Saathi", FedEx → DHL/Blue Dart, Skype → WhatsApp video after Skype's shutdown).