# Raksha evaluation report

Generated 2026-09-16T03:55:30.985Z · runtime **Moss runtime (in-process, 1 index loaded)** · 409 playbook docs · model `moss-minilm`

| Metric | Value |
|---|---|
| Scam scenarios detected (reached DANGER) | 100% |
| Benign scenarios wrongly escalated to DANGER | 0% |
| Scam family identified correctly | 90% |
| Mean turn at which DANGER fired | 3.9 |
| Retrieval latency p50 / p95 / p99 (ms, end-to-end incl. embedding) | 8.01 / 14.95 / 18.55 |
| Mean engine-reported search time (ms) | 8.25 |
| Utterances analysed | 264 |
| Benign everyday fragments (not in the index) credited with any tactic | 1 / 80 (1.3%) |
| Hardware | Intel(R) Xeon(R) Processor @ 2.10GHz × 4 vCPU, embedding threads 2 |

Scenario counts: 10 scam calls, 8 genuine calls. Latency is wall-clock around `retriever.search()` (query embedding + multi-index cosine search + metadata decode); it excludes speech-to-text and network. See `docs/eval/latency.json` (`npm run eval:bench`) for the dedicated benchmark.

**Limitations.** Scenarios are scripted reconstructions paraphrased from public advisories, not recordings of real calls; accents, background noise and speech-recognition errors are not modelled here (the live-microphone mode exercises them). The benign fragment set is small (80 sentences) and English/Hinglish only.

Benign fragments that were credited (to fix next):
- "I'm at the bank branch, the queue is long but moving." → verification_bypass, authority (top match 0.551: "Please don't visit the branch, the branch KYC queue takes 15 days. Thi")

## Scenarios

| Scenario | Expected | Result | Score | DANGER at turn | Expected by | Family |
|---|---|---|---|---|---|---|
| Bank card OTP | scam | ✅ danger | 89 | 5 | 7 | Card fraud department |
| Genuine bank loan follow-up | benign | ✅ safe | 11 | never | never | Fake customer care |
| Genuine bank fraud call | benign | ✅ safe | 0 | never | never |. |
| Genuine courier delivery | benign | ✅ safe | 20 | never | never | Tech support |
| Genuine family call about money | benign | ✅ safe | 0 | never | never |. |
| Genuine hospital billing call | benign | ✅ caution | 35 | never | never | 'Hi Mum' new number |
| Genuine hospital call | benign | ✅ safe | 0 | never | never |. |
| Genuine job interview scheduling | benign | ✅ safe | 0 | never | never |. |
| Genuine telecom plan upgrade | benign | ✅ safe | 0 | never | never |. |
| Courier parcel hand-off | scam | ✅ danger | 93 | 5 | 12 | Courier / parcel |
| Deepfake CFO wire request | scam | ✅ danger | 81 | 3 | 8 | CEO / CFO wire fraud (deepfake) |
| Digital arrest | scam | ✅ danger | 98 | 3 | 9 | Digital arrest |
| Grandparent voice clone | scam | ✅ danger | 96 | 6 | 8 | Family emergency / voice clone |
| Investment WhatsApp group | scam | ✅ danger | 92 | 5 | 12 | Investment / trading |
| Telegram task job scam | scam | ✅ danger | 75 | 3 | 8 | Job / task scam |
| Tech support remote access | scam | ✅ danger | 92 | 3 | 10 | Tech support |
| TRAI SIM disconnection | scam | ✅ danger | 95 | 3 | 9 | TRAI / SIM disconnection |
| UPI QR 'refund' scam | scam | ✅ danger | 88 | 3 | 8 | E-commerce order fraud |

## Turn-by-turn

### Bank card OTP (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe |. | benign/benign | 0.562 | 11.22 |
| 2 | user | 0 | safe |. | ceo_wire_fraud/tactic | 0.219 | 5.8 |
| 3 | caller | 48 | caution | account_compromise, authority, fear | card_fraud_dept/tactic | 0.848 | 12.76 |
| 4 | user | 48 | caution |. | card_fraud_dept/tactic | 0.463 | 8.27 |
| 5 | caller | 78 | danger | otp_request, personal_info, verification_bypass, hold_the_line | card_fraud_dept/tactic | 0.671 | 15.33 |
| 6 | user | 85 | danger | victim_compliance, personal_info | bank_kyc/tactic | 0.564 | 10.16 |
| 7 | caller | 85 | danger | otp_request, account_compromise, personal_info | safe_account/tactic | 0.583 | 9.01 |
| 8 | user | 85 | danger |. | digital_arrest/tactic | 0.572 | 7 |
| 9 | caller | 85 | danger | otp_request, personal_info, authority | card_fraud_dept/tactic | 0.617 | 12.63 |
| 10 | user | 85 | danger |. | social_security/tactic | 0.429 | 3.95 |
| 11 | caller | 88 | danger | otp_request, urgency, escalation, verification_bypass | bank_kyc/tactic | 0.634 | 11.33 |
| 12 | user | 88 | danger |. | card_fraud_dept/tactic | 0.75 | 12.67 |
| 13 | caller | 88 | danger |. | tech_support/tactic | 0.522 | 12.58 |
| 14 | user | 88 | danger |. | bank_kyc/tactic | 0.42 | 6.8 |
| 15 | caller | 89 | danger | otp_request, verification_bypass, urgency, escalation | card_fraud_dept/tactic | 0.673 | 15.34 |
| 16 | user | 89 | danger |. | benign/benign | 0.73 | 10.38 |

### Genuine bank loan follow-up (benign)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe |. | benign/benign | 0.476 | 14.16 |
| 2 | user | 0 | safe |. | medicare/tactic | 0.329 | 9.01 |
| 3 | caller | 0 | safe |. | benign/benign | 0.634 | 17.17 |
| 4 | user | 0 | safe |. | irs/tactic | 0.361 | 8.67 |
| 5 | caller | 0 | safe |. | insurance_policy/tactic | 0.559 | 15.83 |
| 6 | user | 0 | safe |. | hi_mum/tactic | 0.306 | 7.29 |
| 7 | caller | 11 | safe | otp_request | fake_customer_care/tactic | 0.494 | 11.29 |
| 8 | user | 11 | safe |. | hi_mum/tactic | 0.463 | 4.54 |
| 9 | caller | 11 | safe |. | benign/benign | 0.518 | 9 |
| 10 | user | 11 | safe |. | irs/tactic | 0.264 | 4.67 |

### Genuine bank fraud call (benign)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe |. | benign/benign | 0.765 | 20.53 |
| 2 | user | 0 | safe |. | govt_scheme/tactic | 0.458 | 5.81 |
| 3 | caller | 0 | safe |. | benign/benign | 0.688 | 10.03 |
| 4 | user | 0 | safe |. | card_fraud_dept/tactic | 0.45 | 6.56 |
| 5 | caller | 0 | safe |. | card_fraud_dept/tactic | 0.611 | 9.31 |
| 6 | user | 0 | safe |. | benign/benign | 0.578 | 5.77 |
| 7 | caller | 0 | safe |. | benign/benign | 0.626 | 11.12 |
| 8 | user | 0 | safe |. | hi_mum/tactic | 0.325 | 4.4 |
| 9 | caller | 0 | safe |. | benign/benign | 0.616 | 13.63 |
| 10 | user | 0 | safe |. | ceo_wire_fraud/tactic | 0.226 | 4.65 |
| 11 | caller | 0 | safe |. | fake_customer_care/tactic | 0.598 | 12.44 |
| 12 | user | 0 | safe |. | medicare/tactic | 0.44 | 4.45 |
| 13 | caller | 0 | safe |. | card_fraud_dept/tactic | 0.506 | 11.91 |
| 14 | user | 0 | safe |. | ceo_wire_fraud/tactic | 0.329 | 5.7 |

### Genuine courier delivery (benign)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe |. | benign/benign | 0.717 | 10.63 |
| 2 | user | 0 | safe |. | benign/benign | 0.478 | 8 |
| 3 | caller | 0 | safe |. | refund_overpayment/tactic | 0.295 | 11.46 |
| 4 | user | 0 | safe |. | bank_kyc/tactic | 0.326 | 8.22 |
| 5 | caller | 0 | safe |. | benign/benign | 0.651 | 14.8 |
| 6 | user | 20 | safe | victim_compliance, remote_access | recovery_scam/tactic | 0.516 | 7.11 |
| 7 | caller | 20 | safe |. | benign/benign | 0.541 | 9.72 |
| 8 | user | 20 | safe |. | tech_support/tactic | 0.383 | 6.69 |
| 9 | caller | 20 | safe |. | refund_overpayment/tactic | 0.44 | 8.25 |
| 10 | user | 20 | safe |. | benign/benign | 0.531 | 7.19 |
| 11 | caller | 20 | safe |. | benign/benign | 0.392 | 5.79 |
| 12 | user | 20 | safe |. | sextortion/tactic | 0.267 | 3.63 |

### Genuine family call about money (benign)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe |. | benign/benign | 0.549 | 8.01 |
| 2 | user | 0 | safe |. | benign/benign | 0.534 | 6.17 |
| 3 | caller | 0 | safe |. | benign/benign | 0.483 | 10.94 |
| 4 | user | 0 | safe |. | hi_mum/tactic | 0.494 | 4.95 |
| 5 | caller | 0 | safe |. | benign/benign | 0.445 | 13.7 |
| 6 | user | 0 | safe |. | benign/benign | 0.377 | 6.41 |
| 7 | caller | 0 | safe |. | benign/benign | 0.501 | 8.79 |
| 8 | user | 0 | safe |. | benign/benign | 0.478 | 5.42 |
| 9 | caller | 0 | safe |. | benign/benign | 0.404 | 10.66 |
| 10 | user | 0 | safe |. | benign/benign | 0.537 | 4.54 |
| 11 | caller | 0 | safe |. | romance/tactic | 0.333 | 4.93 |
| 12 | user | 0 | safe |. | benign/benign | 0.336 | 3.16 |

### Genuine hospital billing call (benign)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe |. | digital_arrest/tactic | 0.403 | 10.86 |
| 2 | user | 0 | safe |. | benign/benign | 0.385 | 4.95 |
| 3 | caller | 0 | safe |. | benign/benign | 0.397 | 11.84 |
| 4 | user | 0 | safe |. | irs/tactic | 0.413 | 5.72 |
| 5 | caller | 0 | safe |. | benign/benign | 0.436 | 13.5 |
| 6 | user | 0 | safe |. | card_fraud_dept/tactic | 0.598 | 5.1 |
| 7 | caller | 0 | safe |. | courier_parcel/tactic | 0.487 | 8.5 |
| 8 | user | 0 | safe |. | benign/benign | 0.323 | 4.36 |
| 9 | caller | 35 | caution | relationship_pretext, urgency, remote_access, tech_pretext | hi_mum/tactic | 0.565 | 10.68 |
| 10 | user | 35 | caution |. | benign/benign | 0.379 | 4.13 |
| 11 | caller | 35 | caution |. | benign/benign | 0.493 | 7.91 |
| 12 | user | 35 | caution |. | bank_kyc/tactic | 0.301 | 3.68 |

### Genuine hospital call (benign)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe |. | benign/benign | 0.474 | 11.29 |
| 2 | user | 0 | safe |. | job_task/tactic | 0.222 | 3.75 |
| 3 | caller | 0 | safe |. | benign/benign | 0.759 | 10.1 |
| 4 | user | 0 | safe |. | benign/benign | 0.45 | 6.08 |
| 5 | caller | 0 | safe |. | benign/benign | 0.691 | 13.93 |
| 6 | user | 0 | safe |. | olx_army/tactic | 0.527 | 5.85 |
| 7 | caller | 0 | safe |. | medicare/tactic | 0.491 | 9.7 |
| 8 | user | 0 | safe |. | benign/benign | 0.298 | 3.65 |
| 9 | caller | 0 | safe |. | benign/benign | 0.39 | 10.99 |
| 10 | user | 0 | safe |. | benign/benign | 0.569 | 5.7 |
| 11 | caller | 0 | safe |. | benign/benign | 0.704 | 9.55 |
| 12 | user | 0 | safe |. | benign/benign | 0.46 | 4.33 |

### Genuine job interview scheduling (benign)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe |. | benign/benign | 0.493 | 10.29 |
| 2 | user | 0 | safe |. | govt_scheme/tactic | 0.374 | 4.1 |
| 3 | caller | 0 | safe |. | romance/tactic | 0.408 | 9.62 |
| 4 | user | 0 | safe |. | benign/benign | 0.417 | 3.94 |
| 5 | caller | 0 | safe |. | benign/benign | 0.405 | 10.36 |
| 6 | user | 0 | safe |. | benign/benign | 0.452 | 5.12 |
| 7 | caller | 0 | safe |. | benign/benign | 0.345 | 9.88 |
| 8 | user | 0 | safe |. | benign/benign | 0.259 | 4.43 |
| 9 | caller | 0 | safe |. | benign/benign | 0.366 | 7.01 |
| 10 | user | 0 | safe |. | benign/benign | 0.342 | 3.68 |

### Genuine telecom plan upgrade (benign)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe |. | sim_disconnection/tactic | 0.501 | 8.1 |
| 2 | user | 0 | safe |. | hi_mum/tactic | 0.296 | 4.27 |
| 3 | caller | 0 | safe |. | medicare/tactic | 0.487 | 11.3 |
| 4 | user | 0 | safe |. | sim_disconnection/tactic | 0.54 | 5.49 |
| 5 | caller | 0 | safe |. | medicare/tactic | 0.375 | 9.84 |
| 6 | user | 0 | safe |. | tech_support/tactic | 0.34 | 5.26 |
| 7 | caller | 0 | safe |. | benign/benign | 0.558 | 9.43 |
| 8 | user | 0 | safe |. | loan_app/tactic | 0.409 | 4.99 |
| 9 | caller | 0 | safe |. | benign/benign | 0.4 | 8.56 |
| 10 | user | 0 | safe |. | irs/tactic | 0.264 | 3.01 |

### Courier parcel hand-off (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 33 | caution | authority, account_compromise | courier_parcel/tactic | 0.791 | 8.78 |
| 2 | user | 33 | caution |. | benign/benign | 0.505 | 3.91 |
| 3 | caller | 33 | caution | authority, account_compromise | courier_parcel/tactic | 0.525 | 9.2 |
| 4 | user | 33 | caution |. | bank_kyc/tactic | 0.414 | 3.47 |
| 5 | caller | 60 | danger | authority, fear, account_compromise, personal_info | courier_parcel/tactic | 0.505 | 21.96 |
| 6 | user | 60 | danger |. | courier_parcel/tactic | 0.601 | 6.74 |
| 7 | caller | 70 | danger | hold_the_line, authority, urgency, legal_threat, account_compromise, escalation, verification_bypass | courier_parcel/tactic | 0.629 | 14.34 |
| 8 | user | 70 | danger |. | benign/benign | 0.314 | 5.32 |
| 9 | caller | 70 | danger | hold_the_line, authority, urgency | courier_parcel/tactic | 0.641 | 8.93 |
| 10 | caller | 76 | danger | authority, legal_threat, account_compromise | digital_arrest/tactic | 0.785 | 13.29 |
| 11 | user | 76 | danger |. | courier_parcel/tactic | 0.446 | 5.36 |
| 12 | caller | 89 | danger | secrecy, isolation, verification_bypass, fear, payment_method | safe_account/tactic | 0.62 | 13.64 |
| 13 | user | 89 | danger |. | safe_account/tactic | 0.559 | 5.2 |
| 14 | caller | 89 | danger | verification_bypass, isolation, fear | digital_arrest/tactic | 0.552 | 13.4 |
| 15 | user | 90 | danger | victim_compliance, personal_info | bank_kyc/tactic | 0.487 | 5.57 |
| 16 | caller | 90 | danger | hold_the_line, isolation, legal_threat, authority | digital_arrest/tactic | 0.57 | 11.9 |
| 17 | user | 90 | danger |. | benign/benign | 0.284 | 4.31 |
| 18 | caller | 93 | danger | fear, urgency, payment_method, authority, personal_info, video_call_demand | sextortion/tactic | 0.629 | 9.53 |

### Deepfake CFO wire request (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 26 | caution | verification_bypass, tech_pretext | ceo_wire_fraud/tactic | 0.644 | 9.91 |
| 2 | user | 26 | caution |. | ceo_wire_fraud/tactic | 0.289 | 5.73 |
| 3 | caller | 73 | danger | authority, secrecy, verification_bypass, urgency | ceo_wire_fraud/tactic | 0.724 | 15.04 |
| 4 | user | 73 | danger |. | romance/tactic | 0.366 | 4.19 |
| 5 | caller | 73 | danger |. | fake_customer_care/tactic | 0.472 | 17.08 |
| 6 | caller | 73 | danger |. | insurance_policy/tactic | 0.412 | 6.7 |
| 7 | user | 73 | danger |. | ceo_wire_fraud/tactic | 0.403 | 7.42 |
| 8 | caller | 76 | danger | authority, verification_bypass, secrecy, fear | ceo_wire_fraud/tactic | 0.59 | 18.55 |
| 9 | user | 76 | danger |. | benign/benign | 0.326 | 3.46 |
| 10 | caller | 80 | danger | isolation, verification_bypass, relationship_pretext, urgency | lottery_prize/tactic | 0.556 | 8.6 |
| 11 | user | 80 | danger |. | job_task/tactic | 0.458 | 5.87 |
| 12 | caller | 80 | danger |. | ceo_wire_fraud/tactic | 0.42 | 13.95 |
| 13 | user | 80 | danger |. | social_security/tactic | 0.365 | 5.73 |
| 14 | caller | 81 | danger | secrecy, fear, authority | ceo_wire_fraud/tactic | 0.527 | 8.12 |
| 15 | user | 81 | danger |. | ceo_wire_fraud/tactic | 0.393 | 2.98 |
| 16 | caller | 81 | danger |. | benign/benign | 0.436 | 7.66 |

### Digital arrest (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 54 | caution | secrecy, isolation, hold_the_line, authority, legal_threat, account_compromise | digital_arrest/tactic | 0.567 | 10.28 |
| 2 | user | 54 | caution |. | card_fraud_dept/tactic | 0.214 | 4.36 |
| 3 | caller | 75 | danger | authority, fear, account_compromise, personal_info | courier_parcel/tactic | 0.644 | 11.4 |
| 4 | user | 85 | danger | victim_compliance, payment_method | courier_parcel/tactic | 0.605 | 6 |
| 5 | caller | 85 | danger | authority, account_compromise, fear | digital_arrest/tactic | 0.823 | 17.4 |
| 6 | user | 85 | danger |. | hi_mum/tactic | 0.434 | 6.43 |
| 7 | caller | 85 | danger | secrecy, isolation, authority, legal_threat | digital_arrest/tactic | 0.521 | 13.38 |
| 8 | user | 85 | danger |. | romance/tactic | 0.304 | 4.24 |
| 9 | caller | 91 | danger | video_call_demand, authority, escalation | digital_arrest/tactic | 0.755 | 12.89 |
| 10 | user | 91 | danger |. | jury_duty/tactic | 0.535 | 7.15 |
| 11 | caller | 93 | danger | hold_the_line, isolation, legal_threat, authority | digital_arrest/tactic | 0.63 | 14.95 |
| 12 | user | 93 | danger |. | benign/benign | 0.351 | 5.57 |
| 13 | caller | 95 | danger | payment_method, verification_bypass, authority, urgency | safe_account/tactic | 0.529 | 9.73 |
| 14 | user | 96 | danger | victim_compliance, personal_info | bank_kyc/tactic | 0.686 | 8.17 |
| 15 | caller | 98 | danger | payment_method, verification_bypass, authority, urgency | digital_arrest/tactic | 0.921 | 14.49 |
| 16 | user | 98 | danger | victim_compliance, payment_method | safe_account/tactic | 0.511 | 6.61 |
| 17 | caller | 98 | danger |. | family_emergency/tactic | 0.477 | 13.84 |
| 18 | user | 98 | danger |. | bank_kyc/tactic | 0.278 | 4.05 |
| 19 | caller | 98 | danger | payment_method, verification_bypass, authority, urgency | digital_arrest/tactic | 0.666 | 14.19 |
| 20 | user | 98 | danger |. | benign/benign | 0.379 | 5.87 |
| 21 | caller | 98 | danger | escalation, legal_threat, payment_method | digital_arrest/tactic | 0.72 | 14.82 |
| 22 | user | 98 | danger |. | digital_arrest/tactic | 0.46 | 6.78 |
| 23 | caller | 98 | danger |. | sextortion/tactic | 0.474 | 9.59 |
| 24 | user | 98 | danger | victim_compliance, payment_method, fear | digital_arrest/tactic | 0.501 | 6.04 |

### Grandparent voice clone (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe |. | family_emergency/tactic | 0.561 | 5.27 |
| 2 | user | 0 | safe |. | benign/benign | 0.264 | 5.62 |
| 3 | caller | 35 | caution | relationship_pretext, fear | family_emergency/tactic | 0.732 | 15.74 |
| 4 | user | 35 | caution |. | benign/benign | 0.462 | 5.43 |
| 5 | caller | 35 | caution |. | jury_duty/tactic | 0.503 | 14.48 |
| 6 | caller | 74 | danger | authority, secrecy, legal_threat | family_emergency/tactic | 0.928 | 14.38 |
| 7 | user | 74 | danger |. | olx_army/tactic | 0.284 | 4.67 |
| 8 | caller | 87 | danger | payment_method, urgency | family_emergency/tactic | 0.734 | 12.27 |
| 9 | user | 87 | danger |. | ecommerce_order/tactic | 0.421 | 5.89 |
| 10 | caller | 90 | danger | secrecy, verification_bypass | family_emergency/tactic | 0.634 | 14.05 |
| 11 | user | 90 | danger |. | benign/benign | 0.372 | 4.23 |
| 12 | caller | 94 | danger | hold_the_line, isolation | jury_duty/tactic | 0.669 | 11.32 |
| 13 | user | 96 | danger | victim_compliance, payment_method | refund_overpayment/tactic | 0.676 | 5.35 |
| 14 | caller | 96 | danger |. | refund_overpayment/tactic | 0.586 | 12.14 |
| 15 | user | 96 | danger |. | refund_overpayment/tactic | 0.304 | 5.83 |
| 16 | caller | 96 | danger | escalation, fear, payment_method | family_emergency/tactic | 0.623 | 16 |
| 17 | user | 96 | danger |. | bank_kyc/tactic | 0.371 | 4.65 |
| 18 | caller | 96 | danger | payment_method, verification_bypass | family_emergency/tactic | 0.636 | 11.04 |

### Investment WhatsApp group (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe |. | investment/tactic | 0.545 | 10.42 |
| 2 | user | 0 | safe |. | investment/tactic | 0.41 | 5.63 |
| 3 | caller | 14 | safe | too_good, social_proof | investment/tactic | 0.551 | 10.32 |
| 4 | user | 14 | safe |. | job_task/tactic | 0.296 | 3.73 |
| 5 | caller | 75 | danger | tech_pretext, verification_bypass, remote_access | investment/tactic | 0.699 | 10.85 |
| 6 | user | 75 | danger |. | benign/benign | 0.404 | 4.06 |
| 7 | caller | 75 | danger | social_proof, too_good | job_task/tactic | 0.674 | 13.97 |
| 8 | user | 75 | danger |. | benign/benign | 0.279 | 3.5 |
| 9 | caller | 75 | danger |. | romance/tactic | 0.468 | 10.71 |
| 10 | user | 75 | danger |. | benign/benign | 0.472 | 6.98 |
| 11 | caller | 75 | danger |. | investment/tactic | 0.443 | 14.69 |
| 12 | user | 75 | danger |. | investment/tactic | 0.611 | 6.75 |
| 13 | caller | 75 | danger | isolation, verification_bypass | investment/tactic | 0.505 | 11.22 |
| 14 | user | 85 | danger | victim_compliance, personal_info | bank_kyc/tactic | 0.602 | 7.14 |
| 15 | caller | 85 | danger |. | safe_account/tactic | 0.491 | 6.81 |
| 16 | user | 85 | danger |. | safe_account/tactic | 0.457 | 4.37 |
| 17 | caller | 92 | danger | escalation, payment_method, authority | investment/tactic | 0.801 | 14.34 |
| 18 | user | 92 | danger |. | recovery_scam/tactic | 0.442 | 5.52 |
| 19 | caller | 92 | danger | escalation, payment_method | job_task/tactic | 0.498 | 13.67 |
| 20 | user | 92 | danger | victim_compliance, payment_method | safe_account/tactic | 0.555 | 5.56 |

### Telegram task job scam (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 40 | caution | relationship_pretext, urgency, isolation, verification_bypass | hi_mum/tactic | 0.6 | 10.25 |
| 2 | user | 40 | caution |. | job_task/tactic | 0.346 | 4.89 |
| 3 | caller | 60 | danger | fear, urgency, payment_method | sextortion/tactic | 0.511 | 11.82 |
| 4 | user | 60 | danger |. | investment/tactic | 0.435 | 4.43 |
| 5 | caller | 60 | danger |. | job_task/tactic | 0.565 | 9.41 |
| 6 | user | 60 | danger |. | benign/benign | 0.513 | 6.09 |
| 7 | caller | 60 | danger | too_good, verification_bypass, social_proof, isolation | job_task/tactic | 0.569 | 12.77 |
| 8 | user | 60 | danger |. | job_task/tactic | 0.309 | 4.7 |
| 9 | caller | 60 | danger |. | romance/tactic | 0.469 | 13.37 |
| 10 | user | 60 | danger |. | bank_kyc/tactic | 0.464 | 4.93 |
| 11 | caller | 75 | danger | escalation, payment_method, verification_bypass | investment/tactic | 0.584 | 12.67 |
| 12 | user | 75 | danger |. | bank_kyc/tactic | 0.425 | 5.1 |
| 13 | caller | 75 | danger |. | job_task/tactic | 0.453 | 10.71 |
| 14 | user | 75 | danger |. | benign/benign | 0.215 | 4 |

### Tech support remote access (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 31 | caution | tech_pretext, authority | tech_support/tactic | 0.89 | 11.91 |
| 2 | user | 31 | caution |. | ceo_wire_fraud/tactic | 0.261 | 4.68 |
| 3 | caller | 60 | danger | fear, tech_pretext, hold_the_line | tech_support/tactic | 0.486 | 10.31 |
| 4 | user | 60 | danger |. | refund_overpayment/tactic | 0.329 | 4.07 |
| 5 | caller | 60 | danger |. | tech_support/tactic | 0.478 | 13.26 |
| 6 | user | 60 | danger |. | loan_app/tactic | 0.208 | 3.79 |
| 7 | caller | 61 | danger | fear, tech_pretext, hold_the_line | tech_support/tactic | 0.753 | 11.36 |
| 8 | user | 61 | danger |. | family_emergency/tactic | 0.317 | 3.77 |
| 9 | caller | 75 | danger | remote_access | tech_support/tactic | 0.767 | 10.63 |
| 10 | user | 75 | danger |. | bank_kyc/tactic | 0.46 | 7.83 |
| 11 | caller | 80 | danger | remote_access, account_compromise | tech_support/tactic | 0.813 | 11.77 |
| 12 | user | 80 | danger |. | social_security/tactic | 0.25 | 3.24 |
| 13 | caller | 80 | danger | remote_access, account_compromise | tech_support/tactic | 0.643 | 7.39 |
| 14 | user | 80 | danger |. | tech_support/tactic | 0.376 | 5.73 |
| 15 | caller | 90 | danger | payment_method, verification_bypass | social_security/tactic | 0.702 | 16.22 |
| 16 | user | 90 | danger |. | irs/tactic | 0.415 | 4.42 |
| 17 | caller | 92 | danger | secrecy, verification_bypass | tech_support/tactic | 0.654 | 13.5 |
| 18 | user | 92 | danger |. | refund_overpayment/tactic | 0.528 | 5.07 |
| 19 | caller | 92 | danger | secrecy, verification_bypass | refund_overpayment/tactic | 0.59 | 7.63 |
| 20 | user | 92 | danger |. | benign/benign | 0.388 | 4.24 |

### TRAI SIM disconnection (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 53 | caution | authority, urgency, fear | sim_disconnection/tactic | 0.89 | 10.35 |
| 2 | user | 53 | caution |. | loan_app/tactic | 0.482 | 3.75 |
| 3 | caller | 73 | danger | authority, legal_threat, account_compromise, fear, video_call_demand | digital_arrest/tactic | 0.678 | 10.82 |
| 4 | user | 73 | danger |. | sim_disconnection/tactic | 0.692 | 5.22 |
| 5 | caller | 74 | danger | authority, fear, account_compromise | sim_disconnection/tactic | 0.823 | 13.03 |
| 6 | user | 74 | danger |. | tech_support/tactic | 0.415 | 3.75 |
| 7 | caller | 78 | danger | authority, legal_threat, account_compromise, fear, personal_info | digital_arrest/tactic | 0.715 | 11.26 |
| 8 | user | 78 | danger |. | job_task/tactic | 0.377 | 4.15 |
| 9 | caller | 81 | danger | personal_info, authority | courier_parcel/tactic | 0.821 | 11.91 |
| 10 | user | 86 | danger | victim_compliance, personal_info | digital_arrest/tactic | 0.695 | 5.88 |
| 11 | caller | 93 | danger | remote_access, tech_pretext, isolation, verification_bypass, personal_info | utility_disconnection/tactic | 0.621 | 11.99 |
| 12 | user | 93 | danger |. | romance/tactic | 0.298 | 4.35 |
| 13 | caller | 95 | danger | authority, secrecy, verification_bypass, urgency, legal_threat, payment_method | ceo_wire_fraud/tactic | 0.53 | 9.07 |
| 14 | user | 95 | danger | victim_compliance, payment_method, fear | digital_arrest/tactic | 0.543 | 4.2 |

### UPI QR 'refund' scam (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe |. | benign/benign | 0.624 | 7.36 |
| 2 | user | 0 | safe |. | refund_overpayment/tactic | 0.474 | 5.83 |
| 3 | caller | 75 | danger | too_good, otp_request, verification_bypass, payment_method | ecommerce_order/tactic | 0.712 | 8.97 |
| 4 | user | 75 | danger |. | irs/tactic | 0.301 | 4.18 |
| 5 | caller | 75 | danger | too_good, otp_request, verification_bypass, payment_method | ecommerce_order/tactic | 0.677 | 11.46 |
| 6 | user | 85 | danger | victim_compliance, payment_method | upi_cashback/tactic | 0.773 | 5.06 |
| 7 | caller | 86 | danger | payment_method, verification_bypass, authority, urgency, too_good | digital_arrest/tactic | 0.664 | 10.15 |
| 8 | user | 86 | danger |. | refund_overpayment/tactic | 0.585 | 7.55 |
| 9 | caller | 88 | danger | verification_bypass, otp_request, remote_access, authority, too_good | upi_cashback/tactic | 0.636 | 8.33 |
| 10 | user | 88 | danger | victim_compliance, otp_request, payment_method | bank_kyc/tactic | 0.616 | 4.67 |
| 11 | caller | 88 | danger |. | tax_refund/tactic | 0.425 | 9.74 |
| 12 | user | 88 | danger |. | bank_kyc/tactic | 0.362 | 4.35 |

_Pass rule: scam scenarios must reach DANGER no later than 4 turns after the script's first extraction ask; benign scenarios must never reach DANGER._
