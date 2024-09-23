import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SpeechService {

  recognition: any;

  constructor(private http: HttpClient, private ngZone: NgZone) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
  }

startListening(
  callback: (userInput: string) => void, 
  onNoInputDetected?: () => void
) {
  const silenceTimeoutDuration = 5000; // 5 seconds silence timeout
  
  const startRecognition = () => {
    this.recognition.start();

    const silenceTimeout = setTimeout(() => {
      console.log("No input detected, stopping recognition.");
      this.recognition.stop();

      if (onNoInputDetected) {
        onNoInputDetected();
      }
    }, silenceTimeoutDuration);

    this.recognition.onresult = (event: any) => {
      clearTimeout(silenceTimeout);
      const transcript = event.results[0][0].transcript;
      if (event.results[0].isFinal) {
      
        this.ngZone.run(() => {
          callback(transcript);
        });

        // Restart listening for new inputs
        startRecognition();
      }
    };

    this.recognition.onerror = (event: any) => {
      clearTimeout(silenceTimeout);
      console.error('Speech recognition error:', event.error);
      this.recognition.stop(); // Stop recognition on error

      if (onNoInputDetected) {
        onNoInputDetected();
      }
    };

    this.recognition.onend = () => {
      clearTimeout(silenceTimeout);
      console.log("Recognition ended.");
      if (onNoInputDetected) {
        onNoInputDetected();
      }
    };
  };

  startRecognition();
}




  sendMessageToGPT(userMessage: string): Observable<any> {
    return this.http.post<{ response: string }>('http://localhost:8000/api/message', { message: userMessage });
  }
  getMessageLogs(){
    return this.http.get<{ response: string }>('http://localhost:8000/api/conversations');
   
  }



  speakOut(message: string) {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel(); // Stop ongoing speech
    }

    const utterance = new SpeechSynthesisUtterance(message);
      
      utterance.pitch = 1.2; 
      utterance.rate = 1.1; 
  

    const voices = speechSynthesis.getVoices()
    console.log(voices);
    
    utterance.voice = voices[1]
    utterance.onend = () => {
      console.log('Speech has finished speaking.');
      
      this.ngZone.run(() => {

      });

    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
    };

    window.speechSynthesis.speak(utterance);
  
  }
}
