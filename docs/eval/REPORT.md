# Raksha evaluation report

Generated 2026-09-15T13:59:32.595Z · runtime **Moss runtime (in-process, 1 index loaded)** · 409 playbook docs · model `moss-minilm`

| Metric | Value |
|---|---|
| Scam scenarios detected (reached DANGER) | 100% |
| Benign scenarios wrongly escalated to DANGER | 0% |
| Scam family identified correctly | 100% |
| Mean turn at which DANGER fired | 4.3 |
| Retrieval latency p50 / p95 / p99 (ms, end-to-end incl. embedding) | 13.85 / 26.74 / 31.55 |
| Mean engine-reported search time (ms) | 14.78 |
| Utterances analysed | 158 |

## Scenarios

| Scenario | Expected | Result | Score | DANGER at turn | Expected by | Family |
|---|---|---|---|---|---|---|
| Bank card OTP | scam | ✅ danger | 89 | 5 | 7 | Card fraud department |
| Genuine bank fraud call | benign | ✅ safe | 0 | never | never | — |
| Genuine hospital call | benign | ✅ safe | 0 | never | never | — |
| Courier parcel hand-off | scam | ✅ danger | 93 | 5 | 12 | Courier / parcel |
| Deepfake CFO wire request | scam | ✅ danger | 81 | 3 | 8 | CEO / CFO wire fraud (deepfake) |
| Digital arrest | scam | ✅ danger | 98 | 3 | 9 | Digital arrest |
| Grandparent voice clone | scam | ✅ danger | 96 | 6 | 8 | Family emergency / voice clone |
| Investment WhatsApp group | scam | ✅ danger | 92 | 5 | 12 | Investment / trading |
| Tech support remote access | scam | ✅ danger | 92 | 3 | 10 | Tech support |

## Turn-by-turn

### Bank card OTP (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe | — | benign/benign | 0.562 | 14.55 |
| 2 | user | 0 | safe | — | ceo_wire_fraud/tactic | 0.219 | 7.32 |
| 3 | caller | 48 | caution | account_compromise, authority, fear | card_fraud_dept/tactic | 0.848 | 18.01 |
| 4 | user | 48 | caution | — | card_fraud_dept/tactic | 0.463 | 11.66 |
| 5 | caller | 78 | danger | otp_request, personal_info, verification_bypass, hold_the_line | card_fraud_dept/tactic | 0.671 | 23.46 |
| 6 | user | 85 | danger | victim_compliance, personal_info | bank_kyc/tactic | 0.564 | 14.81 |
| 7 | caller | 85 | danger | otp_request, account_compromise, personal_info | safe_account/tactic | 0.583 | 12.55 |
| 8 | user | 85 | danger | — | digital_arrest/tactic | 0.572 | 11.15 |
| 9 | caller | 85 | danger | otp_request, personal_info, authority | card_fraud_dept/tactic | 0.617 | 21.7 |
| 10 | user | 85 | danger | — | social_security/tactic | 0.429 | 7.99 |
| 11 | caller | 88 | danger | otp_request, urgency, escalation, verification_bypass | bank_kyc/tactic | 0.634 | 22.52 |
| 12 | user | 88 | danger | — | card_fraud_dept/tactic | 0.75 | 13.76 |
| 13 | caller | 88 | danger | — | tech_support/tactic | 0.522 | 19.78 |
| 14 | user | 88 | danger | — | bank_kyc/tactic | 0.42 | 10.47 |
| 15 | caller | 89 | danger | otp_request, verification_bypass, urgency, escalation | card_fraud_dept/tactic | 0.673 | 17.43 |
| 16 | user | 89 | danger | — | benign/benign | 0.73 | 14.85 |

### Genuine bank fraud call (benign)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe | — | benign/benign | 0.765 | 31.55 |
| 2 | user | 0 | safe | — | govt_scheme/tactic | 0.458 | 10.79 |
| 3 | caller | 0 | safe | — | benign/benign | 0.688 | 19.73 |
| 4 | user | 0 | safe | — | card_fraud_dept/tactic | 0.45 | 11.47 |
| 5 | caller | 0 | safe | — | card_fraud_dept/tactic | 0.611 | 16.43 |
| 6 | user | 0 | safe | — | benign/benign | 0.578 | 10.32 |
| 7 | caller | 0 | safe | — | benign/benign | 0.626 | 19.66 |
| 8 | user | 0 | safe | — | hi_mum/tactic | 0.325 | 7.97 |
| 9 | caller | 0 | safe | — | benign/benign | 0.616 | 26.74 |
| 10 | user | 0 | safe | — | ceo_wire_fraud/tactic | 0.226 | 20.06 |
| 11 | caller | 0 | safe | — | fake_customer_care/tactic | 0.598 | 20.04 |
| 12 | user | 0 | safe | — | medicare/tactic | 0.44 | 7.87 |
| 13 | caller | 0 | safe | — | card_fraud_dept/tactic | 0.506 | 18.85 |
| 14 | user | 0 | safe | — | ceo_wire_fraud/tactic | 0.329 | 7.6 |

### Genuine hospital call (benign)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe | — | benign/benign | 0.474 | 16.23 |
| 2 | user | 0 | safe | — | job_task/tactic | 0.222 | 6.55 |
| 3 | caller | 0 | safe | — | benign/benign | 0.759 | 16.1 |
| 4 | user | 0 | safe | — | benign/benign | 0.45 | 11.84 |
| 5 | caller | 0 | safe | — | benign/benign | 0.691 | 17.91 |
| 6 | user | 0 | safe | — | olx_army/tactic | 0.527 | 11 |
| 7 | caller | 0 | safe | — | medicare/tactic | 0.491 | 15.69 |
| 8 | user | 0 | safe | — | benign/benign | 0.298 | 6.56 |
| 9 | caller | 0 | safe | — | benign/benign | 0.39 | 18.11 |
| 10 | user | 0 | safe | — | benign/benign | 0.569 | 13.85 |
| 11 | caller | 0 | safe | — | benign/benign | 0.704 | 15.93 |
| 12 | user | 0 | safe | — | benign/benign | 0.46 | 7.82 |

### Courier parcel hand-off (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 33 | caution | authority, account_compromise | courier_parcel/tactic | 0.791 | 14.63 |
| 2 | user | 33 | caution | — | benign/benign | 0.505 | 7.57 |
| 3 | caller | 33 | caution | authority, account_compromise | courier_parcel/tactic | 0.525 | 12.03 |
| 4 | user | 33 | caution | — | bank_kyc/tactic | 0.414 | 6.02 |
| 5 | caller | 60 | danger | authority, fear, account_compromise, personal_info | courier_parcel/tactic | 0.505 | 35.69 |
| 6 | user | 60 | danger | — | courier_parcel/tactic | 0.601 | 11.79 |
| 7 | caller | 70 | danger | hold_the_line, authority, urgency, legal_threat, account_compromise, escalation, verification_bypass | courier_parcel/tactic | 0.629 | 24.92 |
| 8 | user | 70 | danger | — | benign/benign | 0.314 | 9.29 |
| 9 | caller | 70 | danger | hold_the_line, authority, urgency | courier_parcel/tactic | 0.641 | 15.6 |
| 10 | caller | 76 | danger | authority, legal_threat, account_compromise | digital_arrest/tactic | 0.785 | 24.33 |
| 11 | user | 76 | danger | — | courier_parcel/tactic | 0.446 | 9.22 |
| 12 | caller | 89 | danger | secrecy, isolation, verification_bypass, fear, payment_method | safe_account/tactic | 0.62 | 21.06 |
| 13 | user | 89 | danger | — | safe_account/tactic | 0.559 | 9.35 |
| 14 | caller | 89 | danger | verification_bypass, isolation, fear | digital_arrest/tactic | 0.552 | 20.35 |
| 15 | user | 90 | danger | victim_compliance, personal_info | bank_kyc/tactic | 0.487 | 10.32 |
| 16 | caller | 90 | danger | hold_the_line, isolation, legal_threat, authority | digital_arrest/tactic | 0.57 | 18.26 |
| 17 | user | 90 | danger | — | benign/benign | 0.284 | 7.75 |
| 18 | caller | 93 | danger | fear, urgency, payment_method, authority, personal_info, video_call_demand | sextortion/tactic | 0.629 | 14.82 |

### Deepfake CFO wire request (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 26 | caution | verification_bypass, tech_pretext | ceo_wire_fraud/tactic | 0.644 | 15.6 |
| 2 | user | 26 | caution | — | ceo_wire_fraud/tactic | 0.289 | 9.87 |
| 3 | caller | 73 | danger | authority, secrecy, verification_bypass, urgency | ceo_wire_fraud/tactic | 0.724 | 25.05 |
| 4 | user | 73 | danger | — | romance/tactic | 0.366 | 7.72 |
| 5 | caller | 73 | danger | — | fake_customer_care/tactic | 0.472 | 26.76 |
| 6 | caller | 73 | danger | — | insurance_policy/tactic | 0.412 | 11.21 |
| 7 | user | 73 | danger | — | ceo_wire_fraud/tactic | 0.403 | 11.27 |
| 8 | caller | 76 | danger | authority, verification_bypass, secrecy, fear | ceo_wire_fraud/tactic | 0.59 | 27.83 |
| 9 | user | 76 | danger | — | benign/benign | 0.326 | 7.06 |
| 10 | caller | 80 | danger | isolation, verification_bypass, relationship_pretext, urgency | lottery_prize/tactic | 0.556 | 14.3 |
| 11 | user | 80 | danger | — | job_task/tactic | 0.458 | 9.75 |
| 12 | caller | 80 | danger | — | ceo_wire_fraud/tactic | 0.42 | 24.39 |
| 13 | user | 80 | danger | — | social_security/tactic | 0.365 | 9.19 |
| 14 | caller | 81 | danger | secrecy, fear, authority | ceo_wire_fraud/tactic | 0.527 | 13.9 |
| 15 | user | 81 | danger | — | ceo_wire_fraud/tactic | 0.393 | 6.02 |
| 16 | caller | 81 | danger | — | benign/benign | 0.436 | 13.24 |

### Digital arrest (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 54 | caution | secrecy, isolation, hold_the_line, authority, legal_threat, account_compromise | digital_arrest/tactic | 0.567 | 19.37 |
| 2 | user | 54 | caution | — | card_fraud_dept/tactic | 0.214 | 8.43 |
| 3 | caller | 75 | danger | authority, fear, account_compromise, personal_info | courier_parcel/tactic | 0.644 | 20.43 |
| 4 | user | 85 | danger | victim_compliance, payment_method | courier_parcel/tactic | 0.605 | 10.52 |
| 5 | caller | 85 | danger | authority, account_compromise, fear | digital_arrest/tactic | 0.823 | 29.63 |
| 6 | user | 85 | danger | — | hi_mum/tactic | 0.434 | 12.47 |
| 7 | caller | 85 | danger | secrecy, isolation, authority, legal_threat | digital_arrest/tactic | 0.521 | 26.33 |
| 8 | user | 85 | danger | — | romance/tactic | 0.304 | 8.22 |
| 9 | caller | 91 | danger | video_call_demand, authority, escalation | digital_arrest/tactic | 0.755 | 23.7 |
| 10 | user | 91 | danger | — | jury_duty/tactic | 0.535 | 13.65 |
| 11 | caller | 93 | danger | hold_the_line, isolation, legal_threat, authority | digital_arrest/tactic | 0.63 | 24.21 |
| 12 | user | 93 | danger | — | benign/benign | 0.351 | 10.16 |
| 13 | caller | 95 | danger | payment_method, verification_bypass, authority, urgency | safe_account/tactic | 0.529 | 16.55 |
| 14 | user | 96 | danger | victim_compliance, personal_info | bank_kyc/tactic | 0.686 | 16.1 |
| 15 | caller | 98 | danger | payment_method, verification_bypass, authority, urgency | digital_arrest/tactic | 0.921 | 24.84 |
| 16 | user | 98 | danger | victim_compliance, payment_method | safe_account/tactic | 0.511 | 12.39 |
| 17 | caller | 98 | danger | — | family_emergency/tactic | 0.477 | 23.66 |
| 18 | user | 98 | danger | — | bank_kyc/tactic | 0.278 | 8.82 |
| 19 | caller | 98 | danger | payment_method, verification_bypass, authority, urgency | digital_arrest/tactic | 0.666 | 24.63 |
| 20 | user | 98 | danger | — | benign/benign | 0.379 | 11.91 |
| 21 | caller | 98 | danger | escalation, legal_threat, payment_method | digital_arrest/tactic | 0.72 | 25.74 |
| 22 | user | 98 | danger | — | digital_arrest/tactic | 0.46 | 13.48 |
| 23 | caller | 98 | danger | — | sextortion/tactic | 0.474 | 18.19 |
| 24 | user | 98 | danger | victim_compliance, payment_method, fear | digital_arrest/tactic | 0.501 | 12.59 |

### Grandparent voice clone (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe | — | family_emergency/tactic | 0.561 | 9.43 |
| 2 | user | 0 | safe | — | benign/benign | 0.264 | 11.05 |
| 3 | caller | 35 | caution | relationship_pretext, fear | family_emergency/tactic | 0.732 | 27.72 |
| 4 | user | 35 | caution | — | benign/benign | 0.462 | 11.13 |
| 5 | caller | 35 | caution | — | jury_duty/tactic | 0.503 | 26.11 |
| 6 | caller | 74 | danger | authority, secrecy, legal_threat | family_emergency/tactic | 0.928 | 25.81 |
| 7 | user | 74 | danger | — | olx_army/tactic | 0.284 | 10.09 |
| 8 | caller | 87 | danger | payment_method, urgency | family_emergency/tactic | 0.734 | 21.48 |
| 9 | user | 87 | danger | — | ecommerce_order/tactic | 0.421 | 11.57 |
| 10 | caller | 90 | danger | secrecy, verification_bypass | family_emergency/tactic | 0.634 | 24.04 |
| 11 | user | 90 | danger | — | benign/benign | 0.372 | 8.84 |
| 12 | caller | 94 | danger | hold_the_line, isolation | jury_duty/tactic | 0.669 | 15.27 |
| 13 | user | 96 | danger | victim_compliance, payment_method | refund_overpayment/tactic | 0.676 | 10.76 |
| 14 | caller | 96 | danger | — | refund_overpayment/tactic | 0.586 | 20.18 |
| 15 | user | 96 | danger | — | refund_overpayment/tactic | 0.304 | 11.25 |
| 16 | caller | 96 | danger | escalation, fear, payment_method | family_emergency/tactic | 0.623 | 26.76 |
| 17 | user | 96 | danger | — | bank_kyc/tactic | 0.371 | 9.88 |
| 18 | caller | 96 | danger | payment_method, verification_bypass | family_emergency/tactic | 0.636 | 19.18 |

### Investment WhatsApp group (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 0 | safe | — | investment/tactic | 0.545 | 17.01 |
| 2 | user | 0 | safe | — | investment/tactic | 0.41 | 9.49 |
| 3 | caller | 14 | safe | too_good, social_proof | investment/tactic | 0.551 | 21.2 |
| 4 | user | 14 | safe | — | job_task/tactic | 0.296 | 7.35 |
| 5 | caller | 75 | danger | tech_pretext, verification_bypass, remote_access | investment/tactic | 0.699 | 18.08 |
| 6 | user | 75 | danger | — | benign/benign | 0.404 | 8.33 |
| 7 | caller | 75 | danger | social_proof, too_good | job_task/tactic | 0.674 | 22.86 |
| 8 | user | 75 | danger | — | benign/benign | 0.279 | 6.46 |
| 9 | caller | 75 | danger | — | romance/tactic | 0.468 | 17.48 |
| 10 | user | 75 | danger | — | benign/benign | 0.472 | 11.6 |
| 11 | caller | 75 | danger | — | investment/tactic | 0.443 | 23.88 |
| 12 | user | 75 | danger | — | investment/tactic | 0.611 | 12.01 |
| 13 | caller | 75 | danger | isolation, verification_bypass | investment/tactic | 0.505 | 18.6 |
| 14 | user | 85 | danger | victim_compliance, personal_info | bank_kyc/tactic | 0.602 | 11.79 |
| 15 | caller | 85 | danger | — | safe_account/tactic | 0.491 | 12.1 |
| 16 | user | 85 | danger | — | safe_account/tactic | 0.457 | 8.5 |
| 17 | caller | 92 | danger | escalation, payment_method, authority | investment/tactic | 0.801 | 22.51 |
| 18 | user | 92 | danger | — | recovery_scam/tactic | 0.442 | 9.84 |
| 19 | caller | 92 | danger | escalation, payment_method | job_task/tactic | 0.498 | 22.42 |
| 20 | user | 92 | danger | victim_compliance, payment_method | safe_account/tactic | 0.555 | 12.35 |

### Tech support remote access (scam)

| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |
|---|---|---|---|---|---|---|---|
| 1 | caller | 31 | caution | tech_pretext, authority | tech_support/tactic | 0.89 | 20.15 |
| 2 | user | 31 | caution | — | ceo_wire_fraud/tactic | 0.261 | 7.95 |
| 3 | caller | 60 | danger | fear, tech_pretext, hold_the_line | tech_support/tactic | 0.486 | 15.74 |
| 4 | user | 60 | danger | — | refund_overpayment/tactic | 0.329 | 8.46 |
| 5 | caller | 60 | danger | — | tech_support/tactic | 0.478 | 19.12 |
| 6 | user | 60 | danger | — | loan_app/tactic | 0.208 | 7.65 |
| 7 | caller | 61 | danger | fear, tech_pretext, hold_the_line | tech_support/tactic | 0.753 | 18.39 |
| 8 | user | 61 | danger | — | family_emergency/tactic | 0.317 | 7.07 |
| 9 | caller | 75 | danger | remote_access | tech_support/tactic | 0.767 | 17.4 |
| 10 | user | 75 | danger | — | bank_kyc/tactic | 0.46 | 13.35 |
| 11 | caller | 80 | danger | remote_access, account_compromise | tech_support/tactic | 0.813 | 19.7 |
| 12 | user | 80 | danger | — | social_security/tactic | 0.25 | 5.94 |
| 13 | caller | 80 | danger | remote_access, account_compromise | tech_support/tactic | 0.643 | 11.98 |
| 14 | user | 80 | danger | — | tech_support/tactic | 0.376 | 9.88 |
| 15 | caller | 90 | danger | payment_method, verification_bypass | social_security/tactic | 0.702 | 25.92 |
| 16 | user | 90 | danger | — | irs/tactic | 0.415 | 8.52 |
| 17 | caller | 92 | danger | secrecy, verification_bypass | tech_support/tactic | 0.654 | 22.07 |
| 18 | user | 92 | danger | — | refund_overpayment/tactic | 0.528 | 9.63 |
| 19 | caller | 92 | danger | secrecy, verification_bypass | refund_overpayment/tactic | 0.59 | 13.76 |
| 20 | user | 92 | danger | — | benign/benign | 0.388 | 8.64 |

_Pass rule: scam scenarios must reach DANGER no later than 4 turns after the script's first extraction ask; benign scenarios must never reach DANGER._
