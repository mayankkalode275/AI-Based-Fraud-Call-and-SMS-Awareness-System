import speech_recognition as sr

def analyze_audio(file):

    r = sr.Recognizer()

    with sr.AudioFile(file) as source:
        audio = r.record(source)

    try:
        text = r.recognize_google(audio).lower()
    except:
        text = ""

    return text