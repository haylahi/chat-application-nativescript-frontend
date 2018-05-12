"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var index_1 = require("./index");
// tslint:disable-next-line:no-var-requires
var Sqlite = require('nativescript-sqlite');
var DataBaseService = (function () {
    function DataBaseService() {
    }
    DataBaseService.prototype.createTables = function () {
        var _this = this;
        (new Sqlite(index_1.Config.dbName)).then(function (db) {
            _this.database = db;
            if (!_this.checkIfTableExist(index_1.Config.contactTableName)) {
                _this.createContactTable();
            }
            if (!_this.checkIfTableExist(index_1.Config.messageTableName)) {
                _this.createMessagesTable();
            }
        }, function (error) {
            alert('Could Not create a connection to DB.');
        });
    };
    DataBaseService.prototype.createContactTable = function () {
        (new Sqlite(index_1.Config.dbName)).then(function (db) {
            // tslint:disable-next-line:max-line-length
            db.execSQL(index_1.Config.contactsTableCreationQuery).then(function (id) {
                // tslint:disable-next-line:no-console
                console.log('Contacts TABLE CREATED SUCCESSFULLY');
                db.close();
            }, function (error) {
                // tslint:disable-next-line:no-console
                console.log('CREATE TABLE ERROR', error);
            });
        }, function (error) {
            // console.log('error in creating db connection.');
        });
    };
    DataBaseService.prototype.createMessagesTable = function () {
        (new Sqlite(index_1.Config.dbName)).then(function (db) {
            // tslint:disable-next-line:max-line-length
            db.execSQL(index_1.Config.messagesTableCreationQuery).then(function (id) {
                // tslint:disable-next-line:no-console
                console.log('Messages TABLE CREATED SUCCESSFULLY', id);
                db.close();
                // this.getChatMessagesFromService();
            }, function (error) {
                // tslint:disable-next-line:no-console
                console.log('Messages TABLE Could Not be CREATED', error);
            });
        }, function (error) {
            // console.log('error in creating db connection.');
        });
    };
    DataBaseService.prototype.checkIfTableExist = function (tableName) {
        var _this = this;
        // tslint:disable-next-line:max-line-length
        var distinctQuery = 'select DISTINCT tbl_name from sqlite_master where tbl_name = ?';
        (new Sqlite(index_1.Config.dbName)).then(function (db) {
            _this.database = db;
            var checkTableQuery = distinctQuery;
            _this.database.execSQL(checkTableQuery, [tableName])
                .then(function (resultset) {
                for (var row in resultset) {
                    if (resultset.hasOwnProperty('row')) {
                        return true;
                    }
                }
                return false;
            }, function (error) {
                return false;
            });
            return false;
        });
    };
    DataBaseService.prototype.insertIntoChats = function (chat) {
        var _this = this;
        var insertQuery = "\n          INSERT INTO contacts\n          ( number, name, avatar, text, type, muted,\n            lastSeen, unread, last_message_timestamp )\n          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        var updateQuery = "\n          UPDATE contacts\n          SET number = ?, name = ?,\n          avatar =?, text = ?, type = ?, muted = ?, lastSeen = ?, unread = ?,\n          last_message_timestamp = ?\n          WHERE number = ?\n        ";
        var insertJSON = [];
        insertJSON.push(chat.number);
        insertJSON.push(chat.contact.name);
        insertJSON.push(chat.contact.avatar);
        insertJSON.push(chat.text);
        insertJSON.push(chat.type);
        insertJSON.push(chat.muted);
        insertJSON.push(chat.when);
        insertJSON.push(chat.unread);
        insertJSON.push(chat.last_message_timestamp);
        (new Sqlite(index_1.Config.dbName)).then(function (db) {
            db.execSQL(insertQuery, insertJSON).then(function (id) {
                // tslint:disable-next-line:no-console
                console.log('INSERT RESULT', id);
            }, function (error) {
                // tslint:disable-next-line:no-console
                console.log('INSERT ERROR', error);
                var updateJSON = insertJSON;
                updateJSON.push(chat.number);
                _this.database.execSQL(updateQuery, updateJSON).then(function (id) {
                    // tslint:disable-next-line:no-console
                    console.log('UPDATE RESULT Chats', id);
                }, function (err) {
                    // tslint:disable-next-line:no-console
                    console.log('UPDATE ERROR', err);
                });
            });
            db.close();
        });
    };
    DataBaseService.prototype.insertIntoMessages = function (message) {
        var insertQuery = "\n            INSERT INTO messages\n            ( messageText, sender, createdTime, sent, contact)\n            VALUES (?, ?, ?, ?, ?)";
        // tslint:disable-next-line:max-line-length
        var insertJSON = [];
        insertJSON.push(message.text);
        insertJSON.push(parseInt(message.sender, 10));
        insertJSON.push(parseFloat(message.created));
        insertJSON.push(parseInt(message.sent, 10));
        insertJSON.push(message.contact);
        (new Sqlite(index_1.Config.dbName)).then(function (db) {
            db.execSQL(insertQuery, insertJSON).then(function (id) {
                // tslint:disable-next-line:no-console
                console.log('INSERT MEssage RESULT', id);
            }, function (error) {
                // tslint:disable-next-line:no-console
                console.log('INSERT ERROR', error);
            });
            db.close();
        });
    };
    DataBaseService.prototype.updateStatusOfMessage = function (status, id) {
        (new Sqlite(index_1.Config.dbName)).then(function (db) {
            var updateQuery = "\n                UPDATE messages\n                SET sent = ?\n                WHERE id = ?";
            var updateJSON = [];
            updateJSON.push(status);
            updateJSON.push(id);
            db.execSQL(updateQuery, updateJSON).then(function (uniqid) {
                // tslint:disable-next-line:no-console
                console.log('UPDATE SENT STATUS OF MESSAGES', uniqid);
            }, function (err) {
                // tslint:disable-next-line:no-console
                console.log('UPDATE ERROR', err);
            });
            db.close();
        });
    };
    DataBaseService.prototype.updateSentTimeOfMessage = function (sentTime, id) {
        (new Sqlite(index_1.Config.dbName)).then(function (db) {
            var updateQuery = "\n                UPDATE messages\n                SET sentTime = ?\n                WHERE id = ?";
            var updateJSON = [];
            updateJSON.push(sentTime);
            updateJSON.push(id);
            db.execSQL(updateQuery, updateJSON).then(function (uniqid) {
                // tslint:disable-next-line:no-console
                console.log('UPDATE SENT STATUS OF MESSAGES', uniqid);
            }, function (err) {
                // tslint:disable-next-line:no-console
                console.log('UPDATE ERROR', err);
            });
            db.close();
        });
    };
    DataBaseService.prototype.updateDeliveryTimeOfMessage = function (deliveryTime, id) {
        (new Sqlite(index_1.Config.dbName)).then(function (db) {
            var updateQuery = "\n                UPDATE messages\n                SET deliveredTime = ?\n                WHERE id = ?";
            var updateJSON = [];
            updateJSON.push(deliveryTime);
            updateJSON.push(id);
            db.execSQL(updateQuery, updateJSON).then(function (uniqid) {
                // tslint:disable-next-line:no-console
                console.log('UPDATE SENT STATUS OF MESSAGES', uniqid);
            }, function (err) {
                // tslint:disable-next-line:no-console
                console.log('UPDATE ERROR', err);
            });
            db.close();
        });
    };
    DataBaseService.prototype.updateMessaeIdOfMessage = function (messageId, id) {
        (new Sqlite(index_1.Config.dbName)).then(function (db) {
            var updateQuery = "\n                UPDATE messages\n                SET messageId = ?\n                WHERE id = ?";
            var updateJSON = [];
            updateJSON.push(messageId);
            updateJSON.push(id);
            db.execSQL(updateQuery, updateJSON).then(function (uniqid) {
                // tslint:disable-next-line:no-console
                console.log('Message Id Updated OF MESSAGE', uniqid);
            }, function (err) {
                // tslint:disable-next-line:no-console
                console.log('UPDATE ERROR', err);
            });
            db.close();
        });
    };
    DataBaseService = __decorate([
        core_1.Injectable()
    ], DataBaseService);
    return DataBaseService;
}());
exports.DataBaseService = DataBaseService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YWJhc2Uuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRhdGFiYXNlLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzQ0FBMkM7QUFDM0MsaUNBQWlDO0FBQ2pDLDJDQUEyQztBQUMzQyxJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUc5QztJQUFBO0lBaU5BLENBQUM7SUE5TUcsc0NBQVksR0FBWjtRQUFBLGlCQVlDO1FBWEcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxjQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxFQUFFO1lBQ2hDLEtBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1lBQ25CLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSSxDQUFDLGlCQUFpQixDQUFDLGNBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkQsS0FBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDOUIsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSSxDQUFDLGlCQUFpQixDQUFDLGNBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkQsS0FBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDL0IsQ0FBQztRQUNMLENBQUMsRUFBRSxVQUFDLEtBQUs7WUFDTCxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQztRQUNsRCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDRCw0Q0FBa0IsR0FBbEI7UUFDSSxDQUFDLElBQUksTUFBTSxDQUFDLGNBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLEVBQUU7WUFDaEMsMkNBQTJDO1lBQzNDLEVBQUUsQ0FBQyxPQUFPLENBQUMsY0FBTSxDQUFDLDBCQUEwQixDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsRUFBRTtnQkFDbEQsc0NB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R0gsQ0FBQztZQUNsQixJQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7WUFDdEIsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMzQixVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3BCLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLE1BQU07Z0JBQzVDLHNDQUFzQztnQkFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN6RCxDQUFDLEVBQUUsVUFBQyxHQUFHO2dCQUNILHNDQUFzQztnQkFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDckMsQ0FBQyxDQUFDLENBQUM7WUFDSCxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDZixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFoTlEsZUFBZTtRQUQzQixpQkFBVSxFQUFFO09BQ0EsZUFBZSxDQWlOM0I7SUFBRCxzQkFBQztDQUFBLEFBak5ELElBaU5DO0FBak5ZLDBDQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ29uZmlnIH0gZnJvbSAnLi9pbmRleCc7XG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdmFyLXJlcXVpcmVzXG5jb25zdCBTcWxpdGUgPSByZXF1aXJlKCduYXRpdmVzY3JpcHQtc3FsaXRlJyk7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBEYXRhQmFzZVNlcnZpY2Uge1xuICAgIHByaXZhdGUgZGF0YWJhc2U6IGFueTtcbiAgICBwcml2YXRlIHVuc2VudE1lc3NhZ2VzOiBhbnk7XG4gICAgY3JlYXRlVGFibGVzKCkge1xuICAgICAgICAobmV3IFNxbGl0ZShDb25maWcuZGJOYW1lKSkudGhlbigoZGIpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGF0YWJhc2UgPSBkYjtcbiAgICAgICAgICAgIGlmICghdGhpcy5jaGVja0lmVGFibGVFeGlzdChDb25maWcuY29udGFjdFRhYmxlTmFtZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUNvbnRhY3RUYWJsZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0aGlzLmNoZWNrSWZUYWJsZUV4aXN0KENvbmZpZy5tZXNzYWdlVGFibGVOYW1lKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlTWVzc2FnZXNUYWJsZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIGFsZXJ0KCdDb3VsZCBOb3QgY3JlYXRlIGEgY29ubmVjdGlvbiB0byBEQi4nKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNyZWF0ZUNvbnRhY3RUYWJsZSgpIHtcbiAgICAgICAgKG5ldyBTcWxpdGUoQ29uZmlnLmRiTmFtZSkpLnRoZW4oKGRiKSA9PiB7XG4gICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWxpbmUtbGVuZ3RoXG4gICAgICAgICAgICBkYi5leGVjU1FMKENvbmZpZy5jb250YWN0c1RhYmxlQ3JlYXRpb25RdWVyeSkudGhlbigoaWQpID0+IHtcbiAgICAgICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb250YWN0cyBUQUJMRSBDUkVBVEVEIFNVQ0NFU1NGVUxMWScpO1xuICAgICAgICAgICAgICAgIGRiLmNsb3NlKCk7XG4gICAgICAgICAgICB9LCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDUkVBVEUgVEFCTEUgRVJST1InLCBlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnZXJyb3IgaW4gY3JlYXRpbmcgZGIgY29ubmVjdGlvbi4nKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNyZWF0ZU1lc3NhZ2VzVGFibGUoKSB7XG4gICAgICAgIChuZXcgU3FsaXRlKENvbmZpZy5kYk5hbWUpKS50aGVuKChkYikgPT4ge1xuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1heC1saW5lLWxlbmd0aFxuICAgICAgICAgICAgZGIuZXhlY1NRTChDb25maWcubWVzc2FnZXNUYWJsZUNyZWF0aW9uUXVlcnkpLnRoZW4oKGlkKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTWVzc2FnZXMgVEFCTEUgQ1JFQVRFRCBTVUNDRVNTRlVMTFknLCBpZCk7XG4gICAgICAgICAgICAgICAgZGIuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAvLyB0aGlzLmdldENoYXRNZXNzYWdlc0Zyb21TZXJ2aWNlKCk7XG4gICAgICAgICAgICB9LCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdNZXNzYWdlcyBUQUJMRSBDb3VsZCBOb3QgYmUgQ1JFQVRFRCcsIGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdlcnJvciBpbiBjcmVhdGluZyBkYiBjb25uZWN0aW9uLicpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgY2hlY2tJZlRhYmxlRXhpc3QodGFibGVOYW1lKSB7XG4gICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTptYXgtbGluZS1sZW5ndGhcbiAgICAgICAgY29uc3QgZGlzdGluY3RRdWVyeSA9ICdzZWxlY3QgRElTVElOQ1QgdGJsX25hbWUgZnJvbSBzcWxpdGVfbWFzdGVyIHdoZXJlIHRibF9uYW1lID0gPyc7XG4gICAgICAgIChuZXcgU3FsaXRlKENvbmZpZy5kYk5hbWUpKS50aGVuKChkYikgPT4ge1xuICAgICAgICAgICAgdGhpcy5kYXRhYmFzZSA9IGRiO1xuICAgICAgICAgICAgY29uc3QgY2hlY2tUYWJsZVF1ZXJ5ID0gZGlzdGluY3RRdWVyeTtcbiAgICAgICAgICAgIHRoaXMuZGF0YWJhc2UuZXhlY1NRTChjaGVja1RhYmxlUXVlcnksIFt0YWJsZU5hbWVdKVxuICAgICAgICAgICAgICAgIC50aGVuKChyZXN1bHRzZXQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCByb3cgaW4gcmVzdWx0c2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0c2V0Lmhhc093blByb3BlcnR5KCdyb3cnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9LCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaW5zZXJ0SW50b0NoYXRzKGNoYXQpIHtcbiAgICAgICAgY29uc3QgaW5zZXJ0UXVlcnkgPSBgXG4gICAgICAgICAgSU5TRVJUIElOVE8gY29udGFjdHNcbiAgICAgICAgICAoIG51bWJlciwgbmFtZSwgYXZhdGFyLCB0ZXh0LCB0eXBlLCBtdXRlZCxcbiAgICAgICAgICAgIGxhc3RTZWVuLCB1bnJlYWQsIGxhc3RfbWVzc2FnZV90aW1lc3RhbXAgKVxuICAgICAgICAgIFZBTFVFUyAoPywgPywgPywgPywgPywgPywgPywgPywgPylgO1xuICAgICAgICBjb25zdCB1cGRhdGVRdWVyeSA9IGBcbiAgICAgICAgICBVUERBVEUgY29udGFjdHNcbiAgICAgICAgICBTRVQgbnVtYmVyID0gPywgbmFtZSA9ID8sXG4gICAgICAgICAgYXZhdGFyID0/LCB0ZXh0ID0gPywgdHlwZSA9ID8sIG11dGVkID0gPywgbGFzdFNlZW4gPSA/LCB1bnJlYWQgPSA/LFxuICAgICAgICAgIGxhc3RfbWVzc2FnZV90aW1lc3RhbXAgPSA/XG4gICAgICAgICAgV0hFUkUgbnVtYmVyID0gP1xuICAgICAgICBgO1xuICAgICAgICBjb25zdCBpbnNlcnRKU09OID0gW107XG4gICAgICAgIGluc2VydEpTT04ucHVzaChjaGF0Lm51bWJlcik7XG4gICAgICAgIGluc2VydEpTT04ucHVzaChjaGF0LmNvbnRhY3QubmFtZSk7XG4gICAgICAgIGluc2VydEpTT04ucHVzaChjaGF0LmNvbnRhY3QuYXZhdGFyKTtcbiAgICAgICAgaW5zZXJ0SlNPTi5wdXNoKGNoYXQudGV4dCk7XG4gICAgICAgIGluc2VydEpTT04ucHVzaChjaGF0LnR5cGUpO1xuICAgICAgICBpbnNlcnRKU09OLnB1c2goY2hhdC5tdXRlZCk7XG4gICAgICAgIGluc2VydEpTT04ucHVzaChjaGF0LndoZW4pO1xuICAgICAgICBpbnNlcnRKU09OLnB1c2goY2hhdC51bnJlYWQpO1xuICAgICAgICBpbnNlcnRKU09OLnB1c2goY2hhdC5sYXN0X21lc3NhZ2VfdGltZXN0YW1wKTtcbiAgICAgICAgKG5ldyBTcWxpdGUoQ29uZmlnLmRiTmFtZSkpLnRoZW4oKGRiKSA9PiB7XG4gICAgICAgICAgICBkYi5leGVjU1FMKGluc2VydFF1ZXJ5LCBpbnNlcnRKU09OKS50aGVuKChpZCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1jb25zb2xlXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0lOU0VSVCBSRVNVTFQnLCBpZCk7XG4gICAgICAgICAgICB9LCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdJTlNFUlQgRVJST1InLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlSlNPTiA9IGluc2VydEpTT047XG4gICAgICAgICAgICAgICAgdXBkYXRlSlNPTi5wdXNoKGNoYXQubnVtYmVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFiYXNlLmV4ZWNTUUwodXBkYXRlUXVlcnksIHVwZGF0ZUpTT04pLnRoZW4oKGlkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1jb25zb2xlXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdVUERBVEUgUkVTVUxUIENoYXRzJywgaWQpO1xuICAgICAgICAgICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1VQREFURSBFUlJPUicsIGVycik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGRiLmNsb3NlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpbnNlcnRJbnRvTWVzc2FnZXMobWVzc2FnZSkge1xuICAgICAgICBjb25zdCBpbnNlcnRRdWVyeSA9IGBcbiAgICAgICAgICAgIElOU0VSVCBJTlRPIG1lc3NhZ2VzXG4gICAgICAgICAgICAoIG1lc3NhZ2VUZXh0LCBzZW5kZXIsIGNyZWF0ZWRUaW1lLCBzZW50LCBjb250YWN0KVxuICAgICAgICAgICAgVkFMVUVTICg/LCA/LCA/LCA/LCA/KWA7XG4gICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTptYXgtbGluZS1sZW5ndGhcbiAgICAgICAgY29uc3QgaW5zZXJ0SlNPTiA9IFtdO1xuICAgICAgICBpbnNlcnRKU09OLnB1c2gobWVzc2FnZS50ZXh0KTtcbiAgICAgICAgaW5zZXJ0SlNPTi5wdXNoKHBhcnNlSW50KG1lc3NhZ2Uuc2VuZGVyLCAxMCkpO1xuICAgICAgICBpbnNlcnRKU09OLnB1c2gocGFyc2VGbG9hdChtZXNzYWdlLmNyZWF0ZWQpKTtcbiAgICAgICAgaW5zZXJ0SlNPTi5wdXNoKHBhcnNlSW50KG1lc3NhZ2Uuc2VudCwgMTApKTtcbiAgICAgICAgaW5zZXJ0SlNPTi5wdXNoKG1lc3NhZ2UuY29udGFjdCk7XG4gICAgICAgIChuZXcgU3FsaXRlKENvbmZpZy5kYk5hbWUpKS50aGVuKChkYikgPT4ge1xuICAgICAgICAgICAgZGIuZXhlY1NRTChpbnNlcnRRdWVyeSwgaW5zZXJ0SlNPTikudGhlbigoaWQpID0+IHtcbiAgICAgICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdJTlNFUlQgTUVzc2FnZSBSRVNVTFQnLCBpZCk7XG4gICAgICAgICAgICB9LCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdJTlNFUlQgRVJST1InLCBlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGRiLmNsb3NlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB1cGRhdGVTdGF0dXNPZk1lc3NhZ2Uoc3RhdHVzLCBpZCkge1xuICAgICAgICAobmV3IFNxbGl0ZShDb25maWcuZGJOYW1lKSkudGhlbigoZGIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZVF1ZXJ5ID0gYFxuICAgICAgICAgICAgICAgIFVQREFURSBtZXNzYWdlc1xuICAgICAgICAgICAgICAgIFNFVCBzZW50ID0gP1xuICAgICAgICAgICAgICAgIFdIRVJFIGlkID0gP2A7XG4gICAgICAgICAgICBjb25zdCB1cGRhdGVKU09OID0gW107XG4gICAgICAgICAgICB1cGRhdGVKU09OLnB1c2goc3RhdHVzKTtcbiAgICAgICAgICAgIHVwZGF0ZUpTT04ucHVzaChpZCk7XG4gICAgICAgICAgICBkYi5leGVjU1FMKHVwZGF0ZVF1ZXJ5LCB1cGRhdGVKU09OKS50aGVuKCh1bmlxaWQpID0+IHtcbiAgICAgICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdVUERBVEUgU0VOVCBTVEFUVVMgT0YgTUVTU0FHRVMnLCB1bmlxaWQpO1xuICAgICAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1jb25zb2xlXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1VQREFURSBFUlJPUicsIGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGRiLmNsb3NlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB1cGRhdGVTZW50VGltZU9mTWVzc2FnZShzZW50VGltZSwgaWQpIHtcbiAgICAgICAgKG5ldyBTcWxpdGUoQ29uZmlnLmRiTmFtZSkpLnRoZW4oKGRiKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB1cGRhdGVRdWVyeSA9IGBcbiAgICAgICAgICAgICAgICBVUERBVEUgbWVzc2FnZXNcbiAgICAgICAgICAgICAgICBTRVQgc2VudFRpbWUgPSA/XG4gICAgICAgICAgICAgICAgV0hFUkUgaWQgPSA/YDtcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZUpTT04gPSBbXTtcbiAgICAgICAgICAgIHVwZGF0ZUpTT04ucHVzaChzZW50VGltZSk7XG4gICAgICAgICAgICB1cGRhdGVKU09OLnB1c2goaWQpO1xuICAgICAgICAgICAgZGIuZXhlY1NRTCh1cGRhdGVRdWVyeSwgdXBkYXRlSlNPTikudGhlbigodW5pcWlkKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnVVBEQVRFIFNFTlQgU1RBVFVTIE9GIE1FU1NBR0VTJywgdW5pcWlkKTtcbiAgICAgICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdVUERBVEUgRVJST1InLCBlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBkYi5jbG9zZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgdXBkYXRlRGVsaXZlcnlUaW1lT2ZNZXNzYWdlKGRlbGl2ZXJ5VGltZSwgaWQpIHtcbiAgICAgICAgKG5ldyBTcWxpdGUoQ29uZmlnLmRiTmFtZSkpLnRoZW4oKGRiKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB1cGRhdGVRdWVyeSA9IGBcbiAgICAgICAgICAgICAgICBVUERBVEUgbWVzc2FnZXNcbiAgICAgICAgICAgICAgICBTRVQgZGVsaXZlcmVkVGltZSA9ID9cbiAgICAgICAgICAgICAgICBXSEVSRSBpZCA9ID9gO1xuICAgICAgICAgICAgY29uc3QgdXBkYXRlSlNPTiA9IFtdO1xuICAgICAgICAgICAgdXBkYXRlSlNPTi5wdXNoKGRlbGl2ZXJ5VGltZSk7XG4gICAgICAgICAgICB1cGRhdGVKU09OLnB1c2goaWQpO1xuICAgICAgICAgICAgZGIuZXhlY1NRTCh1cGRhdGVRdWVyeSwgdXBkYXRlSlNPTikudGhlbigodW5pcWlkKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnVVBEQVRFIFNFTlQgU1RBVFVTIE9GIE1FU1NBR0VTJywgdW5pcWlkKTtcbiAgICAgICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdVUERBVEUgRVJST1InLCBlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBkYi5jbG9zZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgdXBkYXRlTWVzc2FlSWRPZk1lc3NhZ2UobWVzc2FnZUlkLCBpZCkge1xuICAgICAgICAobmV3IFNxbGl0ZShDb25maWcuZGJOYW1lKSkudGhlbigoZGIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZVF1ZXJ5ID0gYFxuICAgICAgICAgICAgICAgIFVQREFURSBtZXNzYWdlc1xuICAgICAgICAgICAgICAgIFNFVCBtZXNzYWdlSWQgPSA/XG4gICAgICAgICAgICAgICAgV0hFUkUgaWQgPSA/YDtcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZUpTT04gPSBbXTtcbiAgICAgICAgICAgIHVwZGF0ZUpTT04ucHVzaChtZXNzYWdlSWQpO1xuICAgICAgICAgICAgdXBkYXRlSlNPTi5wdXNoKGlkKTtcbiAgICAgICAgICAgIGRiLmV4ZWNTUUwodXBkYXRlUXVlcnksIHVwZGF0ZUpTT04pLnRoZW4oKHVuaXFpZCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1jb25zb2xlXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ01lc3NhZ2UgSWQgVXBkYXRlZCBPRiBNRVNTQUdFJywgdW5pcWlkKTtcbiAgICAgICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdVUERBVEUgRVJST1InLCBlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBkYi5jbG9zZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=