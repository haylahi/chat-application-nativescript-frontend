import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, Inject, OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getString } from 'application-settings';
import { registerElement } from 'nativescript-angular';
import { RouterExtensions } from 'nativescript-angular/router';
import { PullToRefresh } from 'nativescript-pulltorefresh';
import { Observable } from 'rxjs/Observable';
import { AnonymousSubscription } from 'rxjs/Subscription';
import { Chat, ChatsService, Contact } from '../core';
import { DataBaseService } from '../core/database.service';
import { Message } from '../core/models/message.model';
// tslint:disable-next-line:no-var-requires
const Sqlite = require('nativescript-sqlite');
import { Config } from '../core/index';

@Component({
  moduleId: module.id,
  selector: 'ns-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements OnInit {
  chatIndex: number;
  chat: any;
  unread: number;
  messages = [];
  userNumber: string;
  lastSeenTime: any;
  private timerSubscription: AnonymousSubscription;
  private MessageSubscription: AnonymousSubscription;
  private database: any;
  constructor(
    private route: ActivatedRoute,
    private chatsService: ChatsService,
    private router: RouterExtensions,
    private ref: ChangeDetectorRef,
    private databaseService: DataBaseService,
    @Inject('platform') public platform,
  ) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.unread = +params.unread;
      this.chat = JSON.parse(params.chatJson);
      this.lastSeenTime = this.chat.when;
    });
    this.userNumber = getString('userId');
    this.getMessages();
  }

  getMessages() {
    // console.log('updating UI');
    // tslint:disable-next-line:max-line-length
    const selectQuery = 'SELECT * FROM messages WHERE contact = ? ORDER BY createdTime';
    (new Sqlite(Config.dbName)).then((db) => {
      db.all(selectQuery, [this.chat.number]).then((rows) => {
        this.messages = [];
        // tslint:disable-next-line:forin
        for (const row in rows) {
          const messageJson = {
            text: '',
            sender: '',
            sent: '',
            created: '',
          };
          messageJson.text = rows[row][1];
          if (rows[row][2] === 1) {
            messageJson.sender = null;
          } else {
            messageJson.sender = this.chat.contact;
          }
          messageJson.created = rows[row][6];
          messageJson.sent = rows[row][7];
          this.messages.push(messageJson);
        }
        db.close();
        // alert('This is new data');
      }, (error) => {
        // tslint:disable-next-line:no-console
        console.log('SELECT ERROR', error);
      });
    });
    this.subscribeToData();
  }
  recieveMessage($event) {
    const textMessage = $event;
    this.chat.text = textMessage;
    this.sendMessageToServer();
  }
  readMessage() {
    const data = {
      user_id: this.userNumber,
      contact_id: this.chat.number,
    };
    this.chatsService.readMessages(data)
      .subscribe((success) => {
        // tslint:disable-next-line:no-console
        console.log('Message read reciepts.');
      }, (error) => {
        // tslint:disable-next-line:no-console
        console.log('Issue in Message Reading.');
      });
  }

  goBack() {
    this.router.back();
  }
  refreshMe(args: any) {
    setTimeout(() => {
      this.getMessages();
      (args.object as PullToRefresh).refreshing = false;
    }, 1000);
  }
  sendMessageToServer() {
    const selectQuery = 'SELECT * FROM messages WHERE sent = 0 LIMIT 1';
    (new Sqlite(Config.dbName)).then((db) => {
      db.all(selectQuery).then((rows) => {
        // tslint:disable-next-line:forin
        for (const row in rows) {
          const data = {
            unique_id: rows[row][0],
            to: rows[row][8],
            from_id: this.userNumber,
            text: rows[row][1],
            created_time: rows[row][6],
          };
          this.chatsService.sendMessage(data)
            .subscribe((success) => {
              if (success.result === 1) {
                this.databaseService.updateStatusOfMessage(
                  success.status, success.unique_id);
                if (success.message_timings.sent_time) {
                  this.databaseService.updateSentTimeOfMessage(
                    success.message_timings.sent_time, success.unique_id);
                }
                if (success.message_timings.delivered_time) {
                  this.databaseService.updateDeliveryTimeOfMessage(
                    success.message_timings.delivered_time,
                    success.unique_id);
                }
                if (success.message_id) {
                  this.databaseService.updateMessaeIdOfMessage(
                    success.message_id, success.unique_id);
                }
              }
            }, (error) => {
              this.databaseService.updateStatusOfMessage(
                error.status, error.unique_id);
            });
        }
      }, (dbErr) => {
        // tslint:disable-next-line:no-console
        console.log(dbErr);
      });
      this.getMessages();
    });
  }
  private subscribeToData(): void {
    // tslint:disable-next-line:max-line-length
    this.timerSubscription = Observable.timer(1000).first().subscribe(() => this.getMessages());
  }
}
