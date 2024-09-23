import { Component, OnInit } from '@angular/core';
import { SpeechService } from '../../services/speech.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet,HttpClientModule,CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{

  conversation: { user: string, bot: string }[] = [];
  isListening: boolean = false;
  isReplying: boolean = false;
  msg= ""
  constructor(private speechService: SpeechService) {}
  ngOnInit(): void {
    if ('speechSynthesis' in window) {
      this.msg = 'Your browser <strong>supports</strong> speech synthesis.';
    } else {
      this.msg= 'Sorry your browser <strong>does not support</strong> speech synthesis.';
  
    }
this.getallConversations()
    
  }
  getallConversations(){
    this.conversation  = []
    this.speechService.getMessageLogs().subscribe((res:any)=>{
      console.log(res);
      if(res.length>0){

        this.conversation = res
      }
      
    })
  }
  // Start conversation: listen, send message, and get AI reply
  startConversation() {
    this.isListening = true;
  
    this.speechService.startListening(
      (userInput: string) => {
        this.isListening = false;
        this.addToConversation('user', userInput);
        console.log("User input detected: ", userInput);
  
        this.isReplying = true;
        
        // Send user input to GPT and get the response
        this.speechService.sendMessageToGPT(userInput).subscribe((data) => {
          const aiResponse = data.response;
  
          console.log("AI response: ", aiResponse);
          this.speechService.speakOut(aiResponse);
          
          this.conversation[this.conversation.length - 1]['bot'] = aiResponse;
          this.isReplying = false;
        },(error)=>{
          this.isListening = false;
          this.isReplying = false;

          this.getallConversations()
        });
      },
      () => {
        console.log("No input detected.");
        this.isListening = false;

        this.getallConversations()
  
      }
    );
  }
  
  

  // Add conversation to the conversation list
  addToConversation(sender: 'user' | 'bot', message: string) {
    
    this.conversation.push({ user: sender === 'user' ? message : '', bot: sender === 'bot' ? message : '' });
  }
}
