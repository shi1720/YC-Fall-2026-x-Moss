# Raksha evaluation report

Generated 2026-09-15T14:16:05.124Z · runtime **Moss runtime (in-process, 1 index loaded)** · 409 playbook docs · model `moss-minilm`

| Metric | Value |
|---|---|
| Scam scenarios detected (reached DANGER) | 100% |
| Benign scenarios wrongly escalated to DANGER | 0% |
| Scam family identified correctly | 90% |
| Mean turn at which DANGER fired | 3.9 |
| Retrieval latency p50 / p95 / p99 (ms, end-to-end incl. embedding) | 9.35 / 18.45 / 23.44 |
| Mean engine-reported search time (ms) | 9.86 |
| Utterances analysed | 264 |
| Benign everyday fragments (not in the index) credited with any tactic | 1 / 80 (1.3%) |
| Hardware | Intel(R) Xeon(R) Processor @ 2.80GHz × 4 vCPU, embedding threads 2 |

Scenario counts: 10 scam calls, 8 genuine calls. Latency is wall-clock around `retriever.search()` (query embedding + multi-index cosine search + metadata decode); it excludes speech-to-text and network. See `docs/eval/latency.json` (`npm run eval:bench`) for the dedicated benchmark.

**Limitations.** Scenarios are scripted reconstructions paraphrased from public advisories, not recordings of real calls; accents, background noise and speech-recognition errors are not modelled here (the live-microphone mode exercises them). The benign fragment set is small (80 sentences) and English/Hinglish only.

Benign fragments that were credited (to fix next):
- "I'm at the bank branch, the queue is long but moving." → verification_bypass, authority (top match 0.551: "Please don't visit the branch, the branch KYC queue takes 15 days. Thi")

## Scenarios

| Scenario | Expected | Result | Score | DANGER at turn | Expected by | Family |
|---|---|---|---|---|---|---|
| Bank card OTP | scam | ✅ danger | 89 | 5 | 7 | Card fraud department |
| Genuine bank loan follow-up | benign | ✅ safe | 11 | never | never | Fake customer care |
| Genuine bank fraud call | benign | ✅ safe | 0 | never | never | — |
| Genuine courier delivery | benign | ✅ safe | 20 | never | never | Tech support |
| Genuine family call about money | benign | ✅ safe | 0 | never | never | — |
| Genuine hospital billing call | benign | ✅ caution | 35 | never | never | 'Hi Mum' new number |
| Genuine hospital call | benign | ✅ safe | 0 | never | never | — |
| Genuine job interview scheduling | benign | ✅ safe | 0 | never | never | — |
| Genuine telecom plan upgrade | benign | ✅ safe | 0 | never | never | — |
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
| 1 | caller | 0 | safe | — | benign/benign | 0.562 | 11.41 |
| 2 | user | 0 | safe | — | ceo_wire_fraud/tactic | 0.219 | 6.64 |
| 3 | caller | 48 | caution | account_compromise, authority, fear | card_fraud_dept/tactic | 0.848 | 21.78 |
| 4 | user | 48 | caution | — | card_fraud_dept/tactic | 0.463 | 10.05 |
| 5 | caller | 78 | danger | otp_request, personal_info, verification_bypass, hold_the_line | card_fraud_dept/tactic | 0.671 | 18.23 |
| 6 | user | 85 | danger | victim_compliance, personal_info | bank_kyc/tactic | 0.564 | 13.88 |
| 7 | caller | 85 | danger | otp_request, account_compromise, personal_info | safe_account/tactic | 0.583 | 16.21 |
| 8 | user | 85 | danger | — | digital_arrest/tactic | 0.572 | 7.58 |
| 9 | caller | 85 | danger | otp_request, personal_info, authority | card_fraud_dept/tactic | 0.617 | 16.2 |
| 10 | user | 85 | danger | — | social_security/tactic | 0.429 | 6.3 |
| 11 | caller | 88 | danger | otp_request, urgency, escalation, verification_bypass | bank_kyc/tactic | 0.634 | 13.56 |
| 12 | user | 88 | danger | — | card_fraud_dept/tactic | 0.75 | 9.93 |
| 13 | caller | 88 | danger | — | tech_support/tactic | 0.522 | 13.95 |
| 14 | user | 88 | danger | — | bank_kyc/tactic | 0.42 | 9.07 |
| 15 | caller | 89 | danger | otp_request, verification_bypass, urgency, escalation | card_fraud_dept/tactic | 0.673 | 12.04 |
| 16 | user | 89 | danger | — | benign/benign | 0.73 | 9.4 |

### Genuine bank loan follow-up (benign)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe | — | benign/benign | 0.476 | 13.42 |
| 2 | user | 0 | safe | — | medicare/tactic | 0.329 | 6.4 |
| 3 | caller | 0 | safe | — | benign/benign | 0.634 | 14.12 |
| 4 | user | 0 | safe | — | irs/tactic | 0.361 | 7.03 |
| 5 | caller | 0 | safe | — | insurance_policy/tactic | 0.559 | 12.96 |
| 6 | user | 0 | safe | — | hi_mum/tactic | 0.306 | 11.09 |
| 7 | caller | 11 | safe | otp_request | fake_customer_care/tactic | 0.494 | 11.84 |
| 8 | user | 11 | safe | — | hi_mum/tactic | 0.463 | 9.58 |
| 9 | caller | 11 | safe | — | benign/benign | 0.518 | 11.33 |
| 10 | user | 11 | safe | — | irs/tactic | 0.264 | 7.07 |

### Genuine bank fraud call (benign)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe | — | benign/benign | 0.765 | 22.63 |
| 2 | user | 0 | safe | — | govt_scheme/tactic | 0.458 | 7.84 |
| 3 | caller | 0 | safe | — | benign/benign | 0.688 | 15.02 |
| 4 | user | 0 | safe | — | card_fraud_dept/tactic | 0.45 | 8.92 |
| 5 | caller | 0 | safe | — | card_fraud_dept/tactic | 0.611 | 14.8 |
| 6 | user | 0 | safe | — | benign/benign | 0.578 | 8.72 |
| 7 | caller | 0 | safe | — | benign/benign | 0.626 | 13.16 |
| 8 | user | 0 | safe | — | hi_mum/tactic | 0.325 | 6.08 |
| 9 | caller | 0 | safe | — | benign/benign | 0.616 | 17.93 |
| 10 | user | 0 | safe | — | ceo_wire_fraud/tactic | 0.226 | 6.56 |
| 11 | caller | 0 | safe | — | fake_customer_care/tactic | 0.598 | 15.34 |
| 12 | user | 0 | safe | — | medicare/tactic | 0.44 | 10.34 |
| 13 | caller | 0 | safe | — | card_fraud_dept/tactic | 0.506 | 17.78 |
| 14 | user | 0 | safe | — | ceo_wire_fraud/tactic | 0.329 | 7.32 |

### Genuine courier delivery (benign)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe | — | benign/benign | 0.717 | 12.86 |
| 2 | user | 0 | safe | — | benign/benign | 0.478 | 7.88 |
| 3 | caller | 0 | safe | — | refund_overpayment/tactic | 0.295 | 9.17 |
| 4 | user | 0 | safe | — | bank_kyc/tactic | 0.326 | 7.45 |
| 5 | caller | 0 | safe | — | benign/benign | 0.651 | 15.4 |
| 6 | user | 20 | safe | victim_compliance, remote_access | recovery_scam/tactic | 0.516 | 8.25 |
| 7 | caller | 20 | safe | — | benign/benign | 0.541 | 10.39 |
| 8 | user | 20 | safe | — | tech_support/tactic | 0.383 | 6.46 |
| 9 | caller | 20 | safe | — | refund_overpayment/tactic | 0.44 | 8.86 |
| 10 | user | 20 | safe | — | benign/benign | 0.531 | 8.87 |
| 11 | caller | 20 | safe | — | benign/benign | 0.392 | 7.6 |
| 12 | user | 20 | safe | — | sextortion/tactic | 0.267 | 5.21 |

### Genuine family call about money (benign)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe | — | benign/benign | 0.549 | 9.43 |
| 2 | user | 0 | safe | — | benign/benign | 0.534 | 7.09 |
| 3 | caller | 0 | safe | — | benign/benign | 0.483 | 12.4 |
| 4 | user | 0 | safe | — | hi_mum/tactic | 0.494 | 6.5 |
| 5 | caller | 0 | safe | — | benign/benign | 0.445 | 15.96 |
| 6 | user | 0 | safe | — | benign/benign | 0.377 | 8.54 |
| 7 | caller | 0 | safe | — | benign/benign | 0.501 | 9.45 |
| 8 | user | 0 | safe | — | benign/benign | 0.478 | 6.47 |
| 9 | caller | 0 | safe | — | benign/benign | 0.404 | 11.61 |
| 10 | user | 0 | safe | — | benign/benign | 0.537 | 6.29 |
| 11 | caller | 0 | safe | — | romance/tactic | 0.333 | 6.45 |
| 12 | user | 0 | safe | — | benign/benign | 0.336 | 4.22 |

### Genuine hospital billing call (benign)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe | — | digital_arrest/tactic | 0.403 | 12.59 |
| 2 | user | 0 | safe | — | benign/benign | 0.385 | 6.92 |
| 3 | caller | 0 | safe | — | benign/benign | 0.397 | 13.54 |
| 4 | user | 0 | safe | — | irs/tactic | 0.413 | 6.47 |
| 5 | caller | 0 | safe | — | benign/benign | 0.436 | 15.24 |
| 6 | user | 0 | safe | — | card_fraud_dept/tactic | 0.598 | 6.95 |
| 7 | caller | 0 | safe | — | courier_parcel/tactic | 0.487 | 9.73 |
| 8 | user | 0 | safe | — | benign/benign | 0.323 | 5.41 |
| 9 | caller | 35 | caution | relationship_pretext, urgency, remote_access, tech_pretext | hi_mum/tactic | 0.565 | 11.14 |
| 10 | user | 35 | caution | — | benign/benign | 0.379 | 5.44 |
| 11 | caller | 35 | caution | — | benign/benign | 0.493 | 8.4 |
| 12 | user | 35 | caution | — | bank_kyc/tactic | 0.301 | 5.35 |

### Genuine hospital call (benign)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe | — | benign/benign | 0.474 | 11.28 |
| 2 | user | 0 | safe | — | job_task/tactic | 0.222 | 4.61 |
| 3 | caller | 0 | safe | — | benign/benign | 0.759 | 12.4 |
| 4 | user | 0 | safe | — | benign/benign | 0.45 | 8.16 |
| 5 | caller | 0 | safe | — | benign/benign | 0.691 | 14.18 |
| 6 | user | 0 | safe | — | olx_army/tactic | 0.527 | 7.34 |
| 7 | caller | 0 | safe | — | medicare/tactic | 0.491 | 11.95 |
| 8 | user | 0 | safe | — | benign/benign | 0.298 | 4.48 |
| 9 | caller | 0 | safe | — | benign/benign | 0.39 | 13.12 |
| 10 | user | 0 | safe | — | benign/benign | 0.569 | 7.31 |
| 11 | caller | 0 | safe | — | benign/benign | 0.704 | 13.98 |
| 12 | user | 0 | safe | — | benign/benign | 0.46 | 5.78 |

### Genuine job interview scheduling (benign)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe | — | benign/benign | 0.493 | 14.95 |
| 2 | user | 0 | safe | — | govt_scheme/tactic | 0.374 | 6.06 |
| 3 | caller | 0 | safe | — | romance/tactic | 0.408 | 11.01 |
| 4 | user | 0 | safe | — | benign/benign | 0.417 | 6.24 |
| 5 | caller | 0 | safe | — | benign/benign | 0.405 | 13.95 |
| 6 | user | 0 | safe | — | benign/benign | 0.452 | 5.87 |
| 7 | caller | 0 | safe | — | benign/benign | 0.345 | 10.85 |
| 8 | user | 0 | safe | — | benign/benign | 0.259 | 5.86 |
| 9 | caller | 0 | safe | — | benign/benign | 0.366 | 8.61 |
| 10 | user | 0 | safe | — | benign/benign | 0.342 | 5.14 |

### Genuine telecom plan upgrade (benign)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe | — | sim_disconnection/tactic | 0.501 | 9.37 |
| 2 | user | 0 | safe | — | hi_mum/tactic | 0.296 | 4.71 |
| 3 | caller | 0 | safe | — | medicare/tactic | 0.487 | 12.97 |
| 4 | user | 0 | safe | — | sim_disconnection/tactic | 0.54 | 7.76 |
| 5 | caller | 0 | safe | — | medicare/tactic | 0.375 | 12.4 |
| 6 | user | 0 | safe | — | tech_support/tactic | 0.34 | 7.02 |
| 7 | caller | 0 | safe | — | benign/benign | 0.558 | 11.49 |
| 8 | user | 0 | safe | — | loan_app/tactic | 0.409 | 6.64 |
| 9 | caller | 0 | safe | — | benign/benign | 0.4 | 9.65 |
| 10 | user | 0 | safe | — | irs/tactic | 0.264 | 4.12 |

### Courier parcel hand-off (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 33 | caution | authority, account_compromise | courier_parcel/tactic | 0.791 | 9.64 |
| 2 | user | 33 | caution | — | benign/benign | 0.505 | 5.88 |
| 3 | caller | 33 | caution | authority, account_compromise | courier_parcel/tactic | 0.525 | 8.77 |
| 4 | user | 33 | caution | — | bank_kyc/tactic | 0.414 | 4.16 |
| 5 | caller | 60 | danger | authority, fear, account_compromise, personal_info | courier_parcel/tactic | 0.505 | 24.03 |
| 6 | user | 60 | danger | — | courier_parcel/tactic | 0.601 | 8.22 |
| 7 | caller | 70 | danger | hold_the_line, authority, urgency, legal_threat, account_compromise, escalation, verification_bypass | courier_parcel/tactic | 0.629 | 16.71 |
| 8 | user | 70 | danger | — | benign/benign | 0.314 | 6.44 |
| 9 | caller | 70 | danger | hold_the_line, authority, urgency | courier_parcel/tactic | 0.641 | 9.65 |
| 10 | caller | 76 | danger | authority, legal_threat, account_compromise | digital_arrest/tactic | 0.785 | 14.6 |
| 11 | user | 76 | danger | — | courier_parcel/tactic | 0.446 | 6.71 |
| 12 | caller | 89 | danger | secrecy, isolation, verification_bypass, fear, payment_method | safe_account/tactic | 0.62 | 13.52 |
| 13 | user | 89 | danger | — | safe_account/tactic | 0.559 | 6.46 |
| 14 | caller | 89 | danger | verification_bypass, isolation, fear | digital_arrest/tactic | 0.552 | 15.27 |
| 15 | user | 90 | danger | victim_compliance, personal_info | bank_kyc/tactic | 0.487 | 7.19 |
| 16 | caller | 90 | danger | hold_the_line, isolation, legal_threat, authority | digital_arrest/tactic | 0.57 | 12.92 |
| 17 | user | 90 | danger | — | benign/benign | 0.284 | 5.38 |
| 18 | caller | 93 | danger | fear, urgency, payment_method, authority, personal_info, video_call_demand | sextortion/tactic | 0.629 | 10.26 |

### Deepfake CFO wire request (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 26 | caution | verification_bypass, tech_pretext | ceo_wire_fraud/tactic | 0.644 | 10.5 |
| 2 | user | 26 | caution | — | ceo_wire_fraud/tactic | 0.289 | 6.61 |
| 3 | caller | 73 | danger | authority, secrecy, verification_bypass, urgency | ceo_wire_fraud/tactic | 0.724 | 17.15 |
| 4 | user | 73 | danger | — | romance/tactic | 0.366 | 5.26 |
| 5 | caller | 73 | danger | — | fake_customer_care/tactic | 0.472 | 18.53 |
| 6 | caller | 73 | danger | — | insurance_policy/tactic | 0.412 | 8 |
| 7 | user | 73 | danger | — | ceo_wire_fraud/tactic | 0.403 | 8.03 |
| 8 | caller | 76 | danger | authority, verification_bypass, secrecy, fear | ceo_wire_fraud/tactic | 0.59 | 19.02 |
| 9 | user | 76 | danger | — | benign/benign | 0.326 | 4.55 |
| 10 | caller | 80 | danger | isolation, verification_bypass, relationship_pretext, urgency | lottery_prize/tactic | 0.556 | 9.3 |
| 11 | user | 80 | danger | — | job_task/tactic | 0.458 | 6.69 |
| 12 | caller | 80 | danger | — | ceo_wire_fraud/tactic | 0.42 | 15.35 |
| 13 | user | 80 | danger | — | social_security/tactic | 0.365 | 6.27 |
| 14 | caller | 81 | danger | secrecy, fear, authority | ceo_wire_fraud/tactic | 0.527 | 10.31 |
| 15 | user | 81 | danger | — | ceo_wire_fraud/tactic | 0.393 | 4.09 |
| 16 | caller | 81 | danger | — | benign/benign | 0.436 | 9.84 |

### Digital arrest (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 54 | caution | secrecy, isolation, hold_the_line, authority, legal_threat, account_compromise | digital_arrest/tactic | 0.567 | 13.01 |
| 2 | user | 54 | caution | — | card_fraud_dept/tactic | 0.214 | 5.48 |
| 3 | caller | 75 | danger | authority, fear, account_compromise, personal_info | courier_parcel/tactic | 0.644 | 13.34 |
| 4 | user | 85 | danger | victim_compliance, payment_method | courier_parcel/tactic | 0.605 | 6.71 |
| 5 | caller | 85 | danger | authority, account_compromise, fear | digital_arrest/tactic | 0.823 | 19.53 |
| 6 | user | 85 | danger | — | hi_mum/tactic | 0.434 | 7.97 |
| 7 | caller | 85 | danger | secrecy, isolation, authority, legal_threat | digital_arrest/tactic | 0.521 | 16.31 |
| 8 | user | 85 | danger | — | romance/tactic | 0.304 | 5.75 |
| 9 | caller | 91 | danger | video_call_demand, authority, escalation | digital_arrest/tactic | 0.755 | 14.37 |
| 10 | user | 91 | danger | — | jury_duty/tactic | 0.535 | 10.16 |
| 11 | caller | 93 | danger | hold_the_line, isolation, legal_threat, authority | digital_arrest/tactic | 0.63 | 16.88 |
| 12 | user | 93 | danger | — | benign/benign | 0.351 | 7.06 |
| 13 | caller | 95 | danger | payment_method, verification_bypass, authority, urgency | safe_account/tactic | 0.529 | 11.4 |
| 14 | user | 96 | danger | victim_compliance, personal_info | bank_kyc/tactic | 0.686 | 9.79 |
| 15 | caller | 98 | danger | payment_method, verification_bypass, authority, urgency | digital_arrest/tactic | 0.921 | 17.19 |
| 16 | user | 98 | danger | victim_compliance, payment_method | safe_account/tactic | 0.511 | 8.63 |
| 17 | caller | 98 | danger | — | family_emergency/tactic | 0.477 | 17.26 |
| 18 | user | 98 | danger | — | bank_kyc/tactic | 0.278 | 6.13 |
| 19 | caller | 98 | danger | payment_method, verification_bypass, authority, urgency | digital_arrest/tactic | 0.666 | 18.12 |
| 20 | user | 98 | danger | — | benign/benign | 0.379 | 7.21 |
| 21 | caller | 98 | danger | escalation, legal_threat, payment_method | digital_arrest/tactic | 0.72 | 16.64 |
| 22 | user | 98 | danger | — | digital_arrest/tactic | 0.46 | 9.26 |
| 23 | caller | 98 | danger | — | sextortion/tactic | 0.474 | 14.62 |
| 24 | user | 98 | danger | victim_compliance, payment_method, fear | digital_arrest/tactic | 0.501 | 8.92 |

### Grandparent voice clone (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe | — | family_emergency/tactic | 0.561 | 6.84 |
| 2 | user | 0 | safe | — | benign/benign | 0.264 | 6.71 |
| 3 | caller | 35 | caution | relationship_pretext, fear | family_emergency/tactic | 0.732 | 23.44 |
| 4 | user | 35 | caution | — | benign/benign | 0.462 | 10.12 |
| 5 | caller | 35 | caution | — | jury_duty/tactic | 0.503 | 20.72 |
| 6 | caller | 74 | danger | authority, secrecy, legal_threat | family_emergency/tactic | 0.928 | 24.01 |
| 7 | user | 74 | danger | — | olx_army/tactic | 0.284 | 8.44 |
| 8 | caller | 87 | danger | payment_method, urgency | family_emergency/tactic | 0.734 | 20.22 |
| 9 | user | 87 | danger | — | ecommerce_order/tactic | 0.421 | 8.07 |
| 10 | caller | 90 | danger | secrecy, verification_bypass | family_emergency/tactic | 0.634 | 17.26 |
| 11 | user | 90 | danger | — | benign/benign | 0.372 | 5.3 |
| 12 | caller | 94 | danger | hold_the_line, isolation | jury_duty/tactic | 0.669 | 10.45 |
| 13 | user | 96 | danger | victim_compliance, payment_method | refund_overpayment/tactic | 0.676 | 7.34 |
| 14 | caller | 96 | danger | — | refund_overpayment/tactic | 0.586 | 18.69 |
| 15 | user | 96 | danger | — | refund_overpayment/tactic | 0.304 | 8.74 |
| 16 | caller | 96 | danger | escalation, fear, payment_method | family_emergency/tactic | 0.623 | 19.38 |
| 17 | user | 96 | danger | — | bank_kyc/tactic | 0.371 | 7.64 |
| 18 | caller | 96 | danger | payment_method, verification_bypass | family_emergency/tactic | 0.636 | 15.16 |

### Investment WhatsApp group (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe | — | investment/tactic | 0.545 | 13.03 |
| 2 | user | 0 | safe | — | investment/tactic | 0.41 | 6.8 |
| 3 | caller | 14 | safe | too_good, social_proof | investment/tactic | 0.551 | 13.45 |
| 4 | user | 14 | safe | — | job_task/tactic | 0.296 | 5.34 |
| 5 | caller | 75 | danger | tech_pretext, verification_bypass, remote_access | investment/tactic | 0.699 | 12.45 |
| 6 | user | 75 | danger | — | benign/benign | 0.404 | 5.5 |
| 7 | caller | 75 | danger | social_proof, too_good | job_task/tactic | 0.674 | 16.16 |
| 8 | user | 75 | danger | — | benign/benign | 0.279 | 4.65 |
| 9 | caller | 75 | danger | — | romance/tactic | 0.468 | 12.08 |
| 10 | user | 75 | danger | — | benign/benign | 0.472 | 8.11 |
| 11 | caller | 75 | danger | — | investment/tactic | 0.443 | 17.38 |
| 12 | user | 75 | danger | — | investment/tactic | 0.611 | 8.01 |
| 13 | caller | 75 | danger | isolation, verification_bypass | investment/tactic | 0.505 | 12.18 |
| 14 | user | 85 | danger | victim_compliance, personal_info | bank_kyc/tactic | 0.602 | 8.01 |
| 15 | caller | 85 | danger | — | safe_account/tactic | 0.491 | 8.93 |
| 16 | user | 85 | danger | — | safe_account/tactic | 0.457 | 5.71 |
| 17 | caller | 92 | danger | escalation, payment_method, authority | investment/tactic | 0.801 | 15.72 |
| 18 | user | 92 | danger | — | recovery_scam/tactic | 0.442 | 9.02 |
| 19 | caller | 92 | danger | escalation, payment_method | job_task/tactic | 0.498 | 14.56 |
| 20 | user | 92 | danger | victim_compliance, payment_method | safe_account/tactic | 0.555 | 8.18 |

### Telegram task job scam (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 40 | caution | relationship_pretext, urgency, isolation, verification_bypass | hi_mum/tactic | 0.6 | 13.15 |
| 2 | user | 40 | caution | — | job_task/tactic | 0.346 | 6.63 |
| 3 | caller | 60 | danger | fear, urgency, payment_method | sextortion/tactic | 0.511 | 13.76 |
| 4 | user | 60 | danger | — | investment/tactic | 0.435 | 6.24 |
| 5 | caller | 60 | danger | — | job_task/tactic | 0.565 | 13.18 |
| 6 | user | 60 | danger | — | benign/benign | 0.513 | 8.36 |
| 7 | caller | 60 | danger | too_good, verification_bypass, social_proof, isolation | job_task/tactic | 0.569 | 19.67 |
| 8 | user | 60 | danger | — | job_task/tactic | 0.309 | 6.15 |
| 9 | caller | 60 | danger | — | romance/tactic | 0.469 | 15.47 |
| 10 | user | 60 | danger | — | bank_kyc/tactic | 0.464 | 5.8 |
| 11 | caller | 75 | danger | escalation, payment_method, verification_bypass | investment/tactic | 0.584 | 14.14 |
| 12 | user | 75 | danger | — | bank_kyc/tactic | 0.425 | 6.86 |
| 13 | caller | 75 | danger | — | job_task/tactic | 0.453 | 12.35 |
| 14 | user | 75 | danger | — | benign/benign | 0.215 | 5.25 |

### Tech support remote access (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 31 | caution | tech_pretext, authority | tech_support/tactic | 0.89 | 13.32 |
| 2 | user | 31 | caution | — | ceo_wire_fraud/tactic | 0.261 | 5.68 |
| 3 | caller | 60 | danger | fear, tech_pretext, hold_the_line | tech_support/tactic | 0.486 | 11.13 |
| 4 | user | 60 | danger | — | refund_overpayment/tactic | 0.329 | 5.5 |
| 5 | caller | 60 | danger | — | tech_support/tactic | 0.478 | 13.87 |
| 6 | user | 60 | danger | — | loan_app/tactic | 0.208 | 6.15 |
| 7 | caller | 61 | danger | fear, tech_pretext, hold_the_line | tech_support/tactic | 0.753 | 15.02 |
| 8 | user | 61 | danger | — | family_emergency/tactic | 0.317 | 5.14 |
| 9 | caller | 75 | danger | remote_access | tech_support/tactic | 0.767 | 14.43 |
| 10 | user | 75 | danger | — | bank_kyc/tactic | 0.46 | 9.61 |
| 11 | caller | 80 | danger | remote_access, account_compromise | tech_support/tactic | 0.813 | 12.88 |
| 12 | user | 80 | danger | — | social_security/tactic | 0.25 | 3.7 |
| 13 | caller | 80 | danger | remote_access, account_compromise | tech_support/tactic | 0.643 | 8.72 |
| 14 | user | 80 | danger | — | tech_support/tactic | 0.376 | 8.45 |
| 15 | caller | 90 | danger | payment_method, verification_bypass | social_security/tactic | 0.702 | 18.45 |
| 16 | user | 90 | danger | — | irs/tactic | 0.415 | 5.37 |
| 17 | caller | 92 | danger | secrecy, verification_bypass | tech_support/tactic | 0.654 | 14.68 |
| 18 | user | 92 | danger | — | refund_overpayment/tactic | 0.528 | 6.56 |
| 19 | caller | 92 | danger | secrecy, verification_bypass | refund_overpayment/tactic | 0.59 | 9.35 |
| 20 | user | 92 | danger | — | benign/benign | 0.388 | 6.49 |

### TRAI SIM disconnection (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 53 | caution | authority, urgency, fear | sim_disconnection/tactic | 0.89 | 11.86 |
| 2 | user | 53 | caution | — | loan_app/tactic | 0.482 | 5.75 |
| 3 | caller | 73 | danger | authority, legal_threat, account_compromise, fear, video_call_demand | digital_arrest/tactic | 0.678 | 11.96 |
| 4 | user | 73 | danger | — | sim_disconnection/tactic | 0.692 | 7.19 |
| 5 | caller | 74 | danger | authority, fear, account_compromise | sim_disconnection/tactic | 0.823 | 14.69 |
| 6 | user | 74 | danger | — | tech_support/tactic | 0.415 | 5.63 |
| 7 | caller | 78 | danger | authority, legal_threat, account_compromise, fear, personal_info | digital_arrest/tactic | 0.715 | 12.66 |
| 8 | user | 78 | danger | — | job_task/tactic | 0.377 | 5.72 |
| 9 | caller | 81 | danger | personal_info, authority | courier_parcel/tactic | 0.821 | 13.25 |
| 10 | user | 86 | danger | victim_compliance, personal_info | digital_arrest/tactic | 0.695 | 7.73 |
| 11 | caller | 93 | danger | remote_access, tech_pretext, isolation, verification_bypass, personal_info | utility_disconnection/tactic | 0.621 | 14.08 |
| 12 | user | 93 | danger | — | romance/tactic | 0.298 | 6.16 |
| 13 | caller | 95 | danger | authority, secrecy, verification_bypass, urgency, legal_threat, payment_method | ceo_wire_fraud/tactic | 0.53 | 11.91 |
| 14 | user | 95 | danger | victim_compliance, payment_method, fear | digital_arrest/tactic | 0.543 | 5.91 |

### UPI QR 'refund' scam (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe | — | benign/benign | 0.624 | 8.8 |
| 2 | user | 0 | safe | — | refund_overpayment/tactic | 0.474 | 6.9 |
| 3 | caller | 75 | danger | too_good, otp_request, verification_bypass, payment_method | ecommerce_order/tactic | 0.712 | 10.81 |
| 4 | user | 75 | danger | — | irs/tactic | 0.301 | 5.77 |
| 5 | caller | 75 | danger | too_good, otp_request, verification_bypass, payment_method | ecommerce_order/tactic | 0.677 | 13.47 |
| 6 | user | 85 | danger | victim_compliance, payment_method | upi_cashback/tactic | 0.773 | 6.79 |
| 7 | caller | 86 | danger | payment_method, verification_bypass, authority, urgency, too_good | digital_arrest/tactic | 0.664 | 11.57 |
| 8 | user | 86 | danger | — | refund_overpayment/tactic | 0.585 | 8.89 |
| 9 | caller | 88 | danger | verification_bypass, otp_request, remote_access, authority, too_good | upi_cashback/tactic | 0.636 | 9.28 |
| 10 | user | 88 | danger | victim_compliance, otp_request, payment_method | bank_kyc/tactic | 0.616 | 6.42 |
| 11 | caller | 88 | danger | — | tax_refund/tactic | 0.425 | 10.98 |
| 12 | user | 88 | danger | — | bank_kyc/tactic | 0.362 | 5.91 |

_Pass rule: scam scenarios must reach DANGER no later than 4 turns after the script's first extraction ask; benign scenarios must never reach DANGER._
