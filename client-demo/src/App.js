import React, { Component } from 'react';
import io from 'socket.io-client';
// import logo from './logo.svg';
import './App.css';

const socketSvr = 'http://localhost:8080';
var socketHandle = null;

class App extends Component {
  constructor(props) {
    super(props);

    this.starttime = Math.floor(Date.now()/1000);  // 开始时间，单位：秒
  }

  // 模拟打开游戏页面
  openGame = (e) => {
    e.preventDefault();
    
    // 连接socket.io
    socketHandle = io.connect(socketSvr);
    socketHandle.on('connect', () => {
      console.log( 'socket.io connected' );

      // 连接上后订阅EosDailyRank消息，接收EOS下注日排行榜
      socketHandle.on('EosDailyRank', (data) => {
        console.log( 'eos daily rank: ', data );
      });

      // 连接上后订阅TrustBetList消息，接收平台游戏下注记录
      socketHandle.on('TrustBetList', (data) => {
        console.log( 'trust bet list: ', data );
      });

      // 连接上后订阅MinerTop消息，接收挖矿排行榜
      socketHandle.on('MinerTop', (data) => {
        console.log( 'miner top 20: ', data );
      });

      // 连接后订阅NewBet消息，接收新的trustbetgame的result
      socketHandle.on('NewBet', (data) => {
        // data字段如下：
        // { player: 'aaaaaaaa3333',                       => 玩家
        //   payin: '1.0000 EOS',                          => 下注金额
        //   payout: '0.0000 EOS',                         => 获奖金额
        //   txtime: 1543822106,                           => 下注时间
        //   dice: { dice1: 6, dice2: 3, dice3: 1 },       => 色子点数
        //   payed: 1,                                     => 0: 奖金未支付  1:奖金已支付
        //   uid: '38d9ce31-a9df-4d62-ac46-5f532cc5256d',  => 下注id
        //   detail: '0:10000:0',                          => 下注类型:下注金额:中奖金额
        //   mine: '100.0000 TBT'                          => 挖矿所得
        // }
        console.log( 'new bet: ', data );
      });

      // 连接后订阅NewChat消息，接收 "废话链天" 弹幕
      socketHandle.on('NewChats', (data) => {
        // data.data是包含如下字段的数组：
        // {
        //   player: 'aaaaaaaa2222',                       => 玩家
        //   quantity: '0.1000 EOS',                       => 金额
        //   memo: '梭哈 梭哈',                             =>  弹幕
        //   block_time: '2018-12-14T06:45:41.500'         => 弹幕时间
        // }
        console.log( 'new chat: ', data );
      });

      // 订阅ChatList，接收聊天记录
      socketHandle.on('ChatList', (data) => {
        console.log('chat list: ', data);
        console.log(new Date(this.starttime*1000));

        if ( typeof data === 'string' ) {
          data = JSON.parse(data);
        }

        let test = JSON.parse(data.data[data.data.length-1]);
        this.starttime = Math.floor((new Date(test.block_time)).getTime() / 1000);

        for ( let tmp of data.data ) {
          if ( typeof tmp === 'string' ) {
            tmp = JSON.parse(tmp);
          }
          console.log(tmp);
        }
      });

      // 订阅NewChatResult，接收新的开奖
      socketHandle.on('NewChatResult', (data) => {
        // data数据结构
        // {
        //   "day": 17882,
        //   "result": [{
        //       "player": "aaaaaaaa3333",
        //       "quantity": "12.3456 EOS",
        //       "ticket": 123456
        //     },{
        //       "player": "aaaaaaaa3333",
        //       "quantity": "12.3456 EOS",
        //       "ticket": 123456
        //     },{
        //       "player": "aaaaaaaa3333",
        //       "quantity": "12.3456 EOS",
        //       "ticket": 123456
        //     },{
        //       "player": "aaaaaaaa3333",
        //       "quantity": "12.3456 EOS",
        //       "ticket": 123456
        //     },{
        //       "player": "aaaaaaaa3333",
        //       "quantity": "12.3456 EOS",
        //       "ticket": 123456
        //     },{
        //       "player": "aaaaaaaa3333",
        //       "quantity": "12.3456 EOS",
        //       "ticket": 123456
        //     }
        //   ]
        // }
        console.log('new chat result: ', data);
      });

      // 订阅ChatResultList，接收中奖记录
      socketHandle.on('ChatResultList', (data) => {
        // data.data数据结构
        // ['{
        //   "day":17882,
        //   "result":[{
        //       "player":"aaaaaaaa3333",
        //       "quantity":"12.3456 EOS",
        //       "ticket":123456
        //   },{
        //       "player":"aaaaaaaa3333",
        //       "quantity":"12.3456 EOS",
        //       "ticket":123456
        //   },{
        //       "player":"aaaaaaaa3333",
        //       "quantity":"12.3456 EOS",
        //       "ticket":123456
        //   },{
        //       "player":"aaaaaaaa3333",
        //       "quantity":"12.3456 EOS",
        //       "ticket":123456
        //   },{
        //       "player":"aaaaaaaa3333",
        //       "quantity":"12.3456 EOS",
        //       "ticket":123456
        //   },{
        //       "player":"aaaaaaaa3333",
        //       "quantity":"12.3456 EOS",
        //       "ticket":123456
        //   }],
        //   "block_time":"2018-12-26T06:05:10.000"
        // }']
        console.log('chat result list: ', data);
      });
    });

    socketHandle.on('error', (err) => {
      console.error( 'socket.io error: ', err );
    });
  }

  // 模拟玩家登陆
  playerLogin = (e) => {
    e.preventDefault();

    if ( socketHandle && socketHandle.connected ) {
      // 先订阅PlayerBetList消息，等下发送Login后这里就会收到玩家下注记录
      socketHandle.on('PlayerBetList', (data) => {
        console.log( 'player bet list: ', data );
      });

      // 发送Login通知
      const player = 'aaaaaaaa3333';
      socketHandle.emit('Login', player);
    } else {
      alert( 'open the game first~' );
    }
  }

  // 请求聊天记录
  getChatList = (e) => {
    e.preventDefault();

    if ( socketHandle && socketHandle.connected ) {
        // startt 和 records 这两个参数名是固定的
        let getChatListParams = {
          startt: this.starttime,
          records: 10,                          // 从 startt 时间往后的多少条记录
        }
        socketHandle.emit('getChatList', JSON.stringify(getChatListParams));
    } else {
      alert( 'open the game first~' );
    }
  }

  // 请求中奖记录
  getChatResultList = (e) => {
    e.preventDefault();

    if ( socketHandle && socketHandle.connected ) {
        // startt 和 records 这两个参数名是固定的
        let getChatResultListParams = {
          startt: -1,  // 期数，小于0将从最新的期数返回
          records: 10, // 从 startt 时间往后的多少条记录
        }
        socketHandle.emit('getChatResultList', JSON.stringify(getChatResultListParams));
    } else {
        alert( 'open the game first~' );
    }
  }


  render() {
    return (
      <div className="my-box">
        <button onClick={this.openGame} className='my-btn'>
          Open Game
        </button>
        <button onClick={this.playerLogin} className='my-btn'>
          Player Login
        </button>
        <button onClick={this.getChatList} className='my-btn'>
          Get ChatList
        </button>
        <button onClick={this.getChatResultList} className='my-btn'>
          Get ChatResultList
        </button>
      </div>
    );
  }

  componentWillUnmount = () => {
    // 退出的时候，应该close该socket.io
    if ( socketHandle && socketHandle.connected ) {
      console.log( 'close socket.io' );
      socketHandle.close();
    }
  }
}

export default App;
