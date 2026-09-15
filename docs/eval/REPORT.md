# Raksha evaluation report

Generated 2026-09-15T10:39:58.269Z · runtime **Offline lexical fallback (BM25). Configure MOSS_PROJECT_ID / MOSS_PROJECT_KEY for the real Moss runtime.** · 409 playbook docs · model `lexical`

| Metric | Value |
|---|---|
| Scam scenarios detected (reached DANGER) | 100% |
| Benign scenarios wrongly escalated to DANGER | 0% |
| Scam family identified correctly | 86% |
| Mean turn at which DANGER fired | 4.1 |
| Retrieval latency p50 / p95 / p99 (ms, end-to-end incl. embedding) | 0.39 / 1.47 / 2.6 |
| Mean engine-reported search time (ms) | 0.52 |
| Utterances analysed | 158 |

## Scenarios

| Scenario | Expected | Result | Score | DANGER at turn | Expected by | Family |
|---|---|---|---|---|---|---|
| Bank card OTP | scam | ✅ danger | 87 | 5 | 7 | Bank KYC / account block |
| Genuine bank fraud call | benign | ✅ safe | 0 | never | never | — |
| Genuine hospital call | benign | ✅ safe | 0 | never | never | — |
| Courier parcel hand-off | scam | ✅ danger | 82 | 5 | 12 | Courier / parcel |
| Deepfake CFO wire request | scam | ✅ danger | 73 | 3 | 8 | CEO / CFO wire fraud (deepfake) |
| Digital arrest | scam | ✅ danger | 97 | 3 | 9 | Digital arrest |
| Grandparent voice clone | scam | ✅ danger | 92 | 6 | 8 | Family emergency / voice clone |
| Investment WhatsApp group | scam | ✅ danger | 89 | 5 | 12 | Investment / trading |
| Tech support remote access | scam | ✅ danger | 90 | 2 | 10 | Tech support |

## Turn-by-turn

### Bank card OTP (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe | — | benign/benign | 0.266 | 2.78 |
| 2 | user | 0 | safe | — | jury_duty/tactic | 0.277 | 0.34 |
| 3 | caller | 42 | caution | account_compromise, authority, fear | card_fraud_dept/tactic | 0.498 | 1.53 |
| 4 | user | 42 | caution | — | ecommerce_order/tactic | 0.311 | 0.95 |
| 5 | caller | 75 | danger | otp_request, personal_info | card_fraud_dept/tactic | 0.491 | 2.6 |
| 6 | user | 75 | danger | — | tax_refund/tactic | 0.111 | 0.63 |
| 7 | caller | 85 | danger | victim_compliance, personal_info | bank_kyc/tactic | 0.456 | 1.17 |
| 8 | user | 85 | danger | victim_compliance, otp_request | bank_kyc/tactic | 0.267 | 0.8 |
| 9 | caller | 85 | danger | — | loan_app/tactic | 0.205 | 1.14 |
| 10 | user | 85 | danger | — | - | 0 | 0.12 |
| 11 | caller | 85 | danger | victim_compliance, otp_request, urgency, escalation | bank_kyc/tactic | 0.382 | 1.22 |
| 12 | user | 85 | danger | victim_compliance, otp_request, remote_access | card_fraud_dept/tactic | 0.666 | 1.21 |
| 13 | caller | 85 | danger | otp_request, verification_bypass | card_fraud_dept/tactic | 0.34 | 1.21 |
| 14 | user | 85 | danger | — | - | 0 | 0.04 |
| 15 | caller | 87 | danger | otp_request, urgency, escalation, personal_info | bank_kyc/tactic | 0.472 | 1.54 |
| 16 | user | 87 | danger | victim_compliance, otp_request | card_fraud_dept/tactic | 0.365 | 0.61 |

### Genuine bank fraud call (benign)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe | — | benign/benign | 0.357 | 2.47 |
| 2 | user | 0 | safe | — | olx_army/tactic | 0.257 | 0.13 |
| 3 | caller | 0 | safe | — | benign/benign | 0.474 | 1.19 |
| 4 | user | 0 | safe | — | ecommerce_order/tactic | 0.311 | 0.48 |
| 5 | caller | 0 | safe | — | benign/benign | 0.406 | 1.47 |
| 6 | user | 0 | safe | — | benign/benign | 0.283 | 0.28 |
| 7 | caller | 0 | safe | — | benign/benign | 0.192 | 1.15 |
| 8 | user | 0 | safe | — | benign/benign | 0.349 | 0.39 |
| 9 | caller | 0 | safe | — | benign/benign | 0.286 | 1.64 |
| 10 | user | 0 | safe | — | benign/benign | 0.316 | 0.21 |
| 11 | caller | 0 | safe | — | benign/benign | 0.272 | 1.43 |
| 12 | user | 0 | safe | — | benign/benign | 0.278 | 0.81 |
| 13 | caller | 0 | safe | — | benign/benign | 0.277 | 1.09 |
| 14 | user | 0 | safe | — | benign/benign | 0.221 | 0.17 |

### Genuine hospital call (benign)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe | — | benign/benign | 0.285 | 1.12 |
| 2 | user | 0 | safe | — | - | 0 | 0.04 |
| 3 | caller | 0 | safe | — | benign/benign | 0.484 | 1.11 |
| 4 | user | 0 | safe | — | benign/benign | 0.312 | 0.53 |
| 5 | caller | 0 | safe | — | benign/benign | 0.405 | 1.34 |
| 6 | user | 0 | safe | — | safe_account/tactic | 0.247 | 0.47 |
| 7 | caller | 0 | safe | — | utility_disconnection/tactic | 0.149 | 1.11 |
| 8 | user | 0 | safe | — | - | 0 | 0.11 |
| 9 | caller | 0 | safe | — | benign/benign | 0.169 | 1.46 |
| 10 | user | 0 | safe | — | bank_kyc/tactic | 0.205 | 0.57 |
| 11 | caller | 0 | safe | — | benign/benign | 0.23 | 1.07 |
| 12 | user | 0 | safe | — | benign/benign | 0.287 | 0.46 |

### Courier parcel hand-off (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 33 | caution | authority, account_compromise | courier_parcel/tactic | 0.894 | 1.15 |
| 2 | user | 33 | caution | — | benign/benign | 0.317 | 0.14 |
| 3 | caller | 33 | caution | — | courier_parcel/tactic | 0.233 | 0.85 |
| 4 | user | 33 | caution | — | benign/benign | 0.252 | 0.17 |
| 5 | caller | 75 | danger | authority, fear, account_compromise, personal_info | courier_parcel/tactic | 0.416 | 1.98 |
| 6 | user | 75 | danger | — | benign/benign | 0.256 | 0.18 |
| 7 | caller | 76 | danger | authority, urgency, escalation, verification_bypass | courier_parcel/tactic | 0.532 | 0.49 |
| 8 | user | 76 | danger | — | sim_disconnection/tactic | 0.37 | 0.08 |
| 9 | caller | 82 | danger | hold_the_line, authority, urgency | courier_parcel/tactic | 0.67 | 0.28 |
| 10 | caller | 82 | danger | — | courier_parcel/tactic | 0.208 | 0.39 |
| 11 | user | 82 | danger | — | safe_account/tactic | 0.19 | 0.11 |
| 12 | caller | 82 | danger | — | courier_parcel/tactic | 0.148 | 0.86 |
| 13 | user | 82 | danger | — | courier_parcel/tactic | 0.273 | 0.22 |
| 14 | caller | 82 | danger | — | digital_arrest/tactic | 0.203 | 0.49 |
| 15 | user | 82 | danger | — | bank_kyc/tactic | 0.159 | 0.11 |
| 16 | caller | 82 | danger | — | job_task/tactic | 0.212 | 0.44 |
| 17 | user | 82 | danger | — | bank_kyc/tactic | 0.269 | 0.08 |
| 18 | caller | 82 | danger | — | digital_arrest/tactic | 0.23 | 0.29 |

### Deepfake CFO wire request (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 23 | safe | verification_bypass, tech_pretext | ceo_wire_fraud/tactic | 0.43 | 0.25 |
| 2 | user | 23 | safe | — | benign/benign | 0.264 | 0.11 |
| 3 | caller | 70 | danger | authority, secrecy, verification_bypass, urgency | ceo_wire_fraud/tactic | 0.522 | 0.71 |
| 4 | user | 70 | danger | — | romance/tactic | 0.321 | 0.12 |
| 5 | caller | 70 | danger | — | ceo_wire_fraud/tactic | 0.131 | 0.61 |
| 6 | caller | 70 | danger | — | utility_disconnection/tactic | 0.169 | 0.29 |
| 7 | user | 70 | danger | — | family_emergency/tactic | 0.199 | 0.21 |
| 8 | caller | 73 | danger | isolation, secrecy, authority, verification_bypass | ceo_wire_fraud/tactic | 0.332 | 0.58 |
| 9 | user | 73 | danger | — | - | 0 | 0.03 |
| 10 | caller | 73 | danger | — | hi_mum/tactic | 0.216 | 0.33 |
| 11 | user | 73 | danger | — | romance/tactic | 0.205 | 0.11 |
| 12 | caller | 73 | danger | authority, verification_bypass | ceo_wire_fraud/tactic | 0.333 | 0.66 |
| 13 | user | 73 | danger | — | safe_account/tactic | 0.247 | 0.18 |
| 14 | caller | 73 | danger | — | irs/tactic | 0.127 | 0.22 |
| 15 | user | 73 | danger | — | - | 0 | 0.01 |
| 16 | caller | 73 | danger | — | benign/benign | 0.181 | 0.18 |

### Digital arrest (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 30 | caution | authority, legal_threat, account_compromise | digital_arrest/tactic | 0.372 | 0.34 |
| 2 | user | 30 | caution | — | - | 0 | 0.01 |
| 3 | caller | 75 | danger | authority, fear, account_compromise, personal_info | courier_parcel/tactic | 0.435 | 0.47 |
| 4 | user | 75 | danger | — | romance/tactic | 0.214 | 0.2 |
| 5 | caller | 75 | danger | authority, account_compromise, fear, video_call_demand, escalation | digital_arrest/tactic | 0.483 | 0.51 |
| 6 | user | 75 | danger | — | digital_arrest/tactic | 0.242 | 0.12 |
| 7 | caller | 75 | danger | secrecy, isolation, authority, legal_threat | digital_arrest/tactic | 0.349 | 0.77 |
| 8 | user | 75 | danger | — | romance/tactic | 0.399 | 0.07 |
| 9 | caller | 85 | danger | victim_compliance, video_call_demand, authority, escalation | digital_arrest/tactic | 0.499 | 0.83 |
| 10 | user | 85 | danger | — | digital_arrest/tactic | 0.26 | 0.24 |
| 11 | caller | 91 | danger | hold_the_line, isolation, legal_threat, authority | digital_arrest/tactic | 0.485 | 0.4 |
| 12 | user | 91 | danger | — | investment/tactic | 0.183 | 0.51 |
| 13 | caller | 93 | danger | payment_method, verification_bypass, authority, urgency | digital_arrest/tactic | 0.28 | 0.38 |
| 14 | user | 93 | danger | victim_compliance, personal_info | bank_kyc/tactic | 0.336 | 0.16 |
| 15 | caller | 97 | danger | payment_method, verification_bypass, authority, urgency | digital_arrest/tactic | 0.526 | 0.93 |
| 16 | user | 97 | danger | — | safe_account/tactic | 0.147 | 0.14 |
| 17 | caller | 97 | danger | victim_compliance, verification_bypass, payment_method | bank_kyc/tactic | 0.296 | 0.49 |
| 18 | user | 97 | danger | — | - | 0 | 0.07 |
| 19 | caller | 97 | danger | — | safe_account/tactic | 0.183 | 0.81 |
| 20 | user | 97 | danger | victim_compliance, verification_bypass, payment_method | bank_kyc/tactic | 0.353 | 0.19 |
| 21 | caller | 97 | danger | escalation, legal_threat, payment_method | digital_arrest/tactic | 0.434 | 0.71 |
| 22 | user | 97 | danger | — | romance/tactic | 0.263 | 0.48 |
| 23 | caller | 97 | danger | victim_compliance, secrecy, hold_the_line | bank_kyc/tactic | 0.257 | 0.39 |
| 24 | user | 97 | danger | victim_compliance, payment_method, fear | digital_arrest/tactic | 0.33 | 0.21 |

### Grandparent voice clone (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe | — | family_emergency/tactic | 0.231 | 0.16 |
| 2 | user | 0 | safe | — | family_emergency/tactic | 0.149 | 0.11 |
| 3 | caller | 20 | safe | relationship_pretext, fear, verification_bypass | family_emergency/tactic | 0.323 | 0.8 |
| 4 | user | 20 | safe | — | refund_overpayment/tactic | 0.226 | 0.1 |
| 5 | caller | 20 | safe | — | benign/benign | 0.177 | 0.57 |
| 6 | caller | 68 | danger | authority, secrecy, legal_threat | family_emergency/tactic | 0.664 | 0.78 |
| 7 | user | 68 | danger | — | family_emergency/tactic | 0.353 | 0.09 |
| 8 | caller | 84 | danger | payment_method, urgency | family_emergency/tactic | 0.664 | 0.54 |
| 9 | user | 84 | danger | — | bank_kyc/tactic | 0.157 | 0.1 |
| 10 | caller | 84 | danger | secrecy, verification_bypass | family_emergency/tactic | 0.259 | 0.91 |
| 11 | user | 84 | danger | — | safe_account/tactic | 0.285 | 0.09 |
| 12 | caller | 85 | danger | hold_the_line, payment_method | irs/tactic | 0.265 | 0.34 |
| 13 | user | 88 | danger | victim_compliance, payment_method | refund_overpayment/tactic | 0.414 | 0.09 |
| 14 | caller | 88 | danger | — | refund_overpayment/tactic | 0.241 | 0.86 |
| 15 | user | 88 | danger | — | - | 0 | 0.05 |
| 16 | caller | 92 | danger | escalation, fear, payment_method | family_emergency/tactic | 0.465 | 0.58 |
| 17 | user | 92 | danger | victim_compliance, payment_method | bank_kyc/tactic | 0.27 | 0.11 |
| 18 | caller | 92 | danger | payment_method, verification_bypass | family_emergency/tactic | 0.335 | 0.78 |

### Investment WhatsApp group (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 18 | safe | authority, too_good, social_proof | investment/tactic | 0.338 | 0.35 |
| 2 | user | 18 | safe | — | family_emergency/tactic | 0.162 | 0.26 |
| 3 | caller | 35 | caution | too_good, social_proof | investment/tactic | 0.332 | 0.71 |
| 4 | user | 35 | caution | — | hi_mum/tactic | 0.475 | 0.05 |
| 5 | caller | 75 | danger | tech_pretext, verification_bypass, remote_access | investment/tactic | 0.661 | 0.5 |
| 6 | user | 75 | danger | — | investment/tactic | 0.295 | 0.08 |
| 7 | caller | 75 | danger | social_proof, too_good | job_task/tactic | 0.456 | 0.71 |
| 8 | user | 75 | danger | — | - | 0 | 0.05 |
| 9 | caller | 75 | danger | payment_method, verification_bypass | investment/tactic | 0.389 | 0.55 |
| 10 | user | 75 | danger | — | job_task/tactic | 0.295 | 0.26 |
| 11 | caller | 75 | danger | too_good, social_proof | investment/tactic | 0.273 | 1.04 |
| 12 | user | 75 | danger | — | investment/tactic | 0.27 | 0.21 |
| 13 | caller | 77 | danger | isolation, verification_bypass | investment/tactic | 0.304 | 0.69 |
| 14 | user | 78 | danger | victim_compliance, payment_method | safe_account/tactic | 0.255 | 0.22 |
| 15 | caller | 78 | danger | — | investment/tactic | 0.202 | 0.22 |
| 16 | user | 78 | danger | — | job_task/tactic | 0.191 | 0.18 |
| 17 | caller | 89 | danger | escalation, payment_method, authority | investment/tactic | 0.624 | 0.82 |
| 18 | user | 89 | danger | — | investment/tactic | 0.329 | 0.08 |
| 19 | caller | 89 | danger | — | social_security/tactic | 0.137 | 0.48 |
| 20 | user | 89 | danger | — | tech_support/tactic | 0.206 | 0.18 |

### Tech support remote access (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 31 | caution | tech_pretext, authority | tech_support/tactic | 0.677 | 0.8 |
| 2 | user | 60 | danger | victim_compliance, remote_access | tech_support/tactic | 0.258 | 0.07 |
| 3 | caller | 60 | danger | — | tech_support/tactic | 0.244 | 0.28 |
| 4 | user | 60 | danger | — | social_security/tactic | 0.206 | 0.08 |
| 5 | caller | 60 | danger | — | tech_support/tactic | 0.222 | 0.4 |
| 6 | user | 60 | danger | — | - | 0 | 0.03 |
| 7 | caller | 64 | danger | fear, tech_pretext, hold_the_line | tech_support/tactic | 0.524 | 0.73 |
| 8 | user | 64 | danger | — | - | 0 | 0.07 |
| 9 | caller | 75 | danger | remote_access | tech_support/tactic | 0.669 | 0.39 |
| 10 | user | 75 | danger | — | - | 0 | 0.02 |
| 11 | caller | 78 | danger | remote_access, account_compromise | tech_support/tactic | 0.431 | 0.38 |
| 12 | user | 78 | danger | — | - | 0 | 0.04 |
| 13 | caller | 83 | danger | remote_access, verification_bypass | refund_overpayment/tactic | 0.495 | 0.3 |
| 14 | user | 83 | danger | — | investment/tactic | 0.251 | 0.1 |
| 15 | caller | 87 | danger | payment_method, hold_the_line, verification_bypass | tech_support/tactic | 0.448 | 0.69 |
| 16 | user | 87 | danger | — | safe_account/tactic | 0.173 | 0.2 |
| 17 | caller | 87 | danger | — | tech_support/tactic | 0.239 | 0.52 |
| 18 | user | 87 | danger | — | refund_overpayment/tactic | 0.397 | 0.11 |
| 19 | caller | 89 | danger | secrecy, verification_bypass | refund_overpayment/tactic | 0.395 | 0.17 |
| 20 | user | 90 | danger | victim_compliance, payment_method | safe_account/tactic | 0.353 | 0.14 |

_Pass rule: scam scenarios must reach DANGER no later than 4 turns after the script's first extraction ask; benign scenarios must never reach DANGER._
