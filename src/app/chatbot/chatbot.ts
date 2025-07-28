import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrls: ['./chatbot.css']
})
export class ChatbotComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isOpen = false;
  messages: ChatMessage[] = [];
  currentMessage = '';
  isLoading = false;
  messageId = 0;
  private shouldScroll = false;

  private readonly API_URL = 'https://api.openai.com/v1/chat/completions';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // إضافة رسالة ترحيب
    setTimeout(() => {
      this.addMessage('مرحباً! كيف يمكنني مساعدتك اليوم؟', false);
    }, 500);

    // إضافة مستمع للنقر خارج الـ chatbot
    document.addEventListener('click', this.onWindowClick.bind(this));
  }

  ngOnDestroy() {
    // تنظيف عند إغلاق المكون
    document.removeEventListener('click', this.onWindowClick.bind(this));
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  onWindowClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.chatbot-window') && !target.closest('.chatbot-button')) {
      this.isOpen = false;
    }
  }

  sendQuickMessage(message: string) {
    this.currentMessage = message;
    this.sendMessage();
  }

  clearChat() {
    this.messages = [];
    this.messageId = 0;
    // إضافة رسالة ترحيب جديدة
    setTimeout(() => {
      this.addMessage('مرحباً! كيف يمكنني مساعدتك اليوم؟', false);
    }, 300);
  }

  sendMessage() {
    if (this.currentMessage.trim() && !this.isLoading) {
      const userMessage = this.currentMessage.trim();
      this.addMessage(userMessage, true);
      this.currentMessage = '';
      this.isLoading = true;

      this.sendToOpenAI(userMessage);
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    try {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  private addMessage(text: string, isUser: boolean) {
    this.messages.push({
      id: ++this.messageId,
      text,
      isUser,
      timestamp: new Date()
    });
    this.shouldScroll = true;
  }

    private async sendToOpenAI(message: string) {
    // استخدام fetch مباشرة بدلاً من HttpClient لتجنب مشاكل CORS
    const body = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'أنت مساعد ذكي ومفيد مثل ChatGPT. يمكنك الإجابة على أي سؤال أو موضوع. إذا كان السؤال متعلق بموقع تسوق إلكتروني، قدم مساعدة متخصصة. وإذا كان سؤال عام، أجب عليه بذكاء ودقة. استجب باللغة العربية دائماً.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    };

    try {
      console.log('Sending request to OpenAI...');
      console.log('Request body:', JSON.stringify(body, null, 2));

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      console.log('OpenAI response:', data);

      if (response.ok) {
        if (data.choices && data.choices[0] && data.choices[0].message) {
          const botResponse = data.choices[0].message.content;
          this.addMessage(botResponse, false);
        } else {
          console.error('Invalid response format:', data);
          this.addMessage('عذراً، حدث خطأ في تنسيق الاستجابة. يرجى المحاولة مرة أخرى.', false);
        }
      } else {
        console.error('API Error:', data);
        let errorMessage = 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.';

        if (response.status === 401) {
          errorMessage = 'خطأ في مفتاح API. يرجى التحقق من المفتاح.';
        } else if (response.status === 429) {
          errorMessage = 'تم تجاوز حد الاستخدام. يرجى المحاولة لاحقاً.';
        } else if (response.status === 400) {
          errorMessage = 'خطأ في طلب البيانات. يرجى المحاولة مرة أخرى.';
        } else if (data.error && data.error.message) {
          errorMessage = `خطأ: ${data.error.message}`;
        }

        this.addMessage(errorMessage, false);
      }
    } catch (error: any) {
      console.error('Error calling OpenAI API:', error);
      this.addMessage('عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.', false);
    } finally {
      this.isLoading = false;
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
