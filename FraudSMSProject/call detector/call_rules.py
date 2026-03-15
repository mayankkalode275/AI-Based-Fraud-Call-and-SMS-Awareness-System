def detect_call(phone, duration, frequency):

    score = 0
    reasons = []

    # international number
    if phone.startswith("+"):
        score += 20
        reasons.append("International number")

    # short call scam
    if duration < 10:
        score += 20
        reasons.append("Very short call")

    # repeated calls
    if frequency > 3:
        score += 20
        reasons.append("Repeated calls")

    prediction = "FRAUD CALL" if score >= 40 else "SAFE CALL"

    return prediction, score, reasons