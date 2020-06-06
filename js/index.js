const Util = {
    HOUR: 24,
    MINUTE_SECOND: 60,
    audio: new Audio(),
    now: function(nowDate) {
        let hour = this.buling(nowDate.getHours());
        let minute = this.buling(nowDate.getMinutes());
        let second = this.buling(nowDate.getSeconds());
        return hour+":"+minute+":"+second;
    },
    time: function(value) {
        let list = [];
        list.push('--');
        for (let i = 0; i < value; i++) {
            list.push(this.buling(i));
        }
        return list;
    },
    hours: function() {
        return this.time(this.HOUR);
    },
    minutesOrSeconds: function() {
        return this.time(this.MINUTE_SECOND);
    },
    buling: function(value) {
        return value < 10 ? '0' + value : '' + value;
    },
    formatSeconds: function(nowTime, settingTime) {
        //把毫秒转为秒
        nowTime = parseInt(nowTime / 1000);
        settingTime = parseInt(settingTime / 1000);
        //当前时间大于设置时间，则设置时间加一天的毫秒量
        if (nowTime > settingTime) {
            settingTime = settingTime + (60 * 60 * 24)
        }
        //算出两时间相差的秒数
        let e = Math.abs((nowTime - settingTime));
        let b = Math.floor(e / 86400);
        let a = Math.floor((e - b * 86400) / 3600);
        let d = Math.floor((e - b * 86400 - a * 3600) / 60);
        let s = e - b * 86400 - a * 3600 - d * 60;
        let c = "";
        if (b > 0) {
            c += b + "天"
        }
        if (a > 0) {
            c += a + "时"
        }
        if (d > 0) {
            c += d + "分"
        }
        if (s > 0) {
            c += s + "秒"
        }
        return c
    },
    str2Bool: function(str) {
        return str === "true";
    },
    str2Int: function(str) {
        return parseInt(str || 0);
    }
}

const storage = window.localStorage;

var vm = new Vue({
    el: "#app",
    data: {
        //常量属性对象
        constData: {
            hours: Util.hours(),
            minutesOrSeconds: Util.minutesOrSeconds(),
            musicArray: [
                {value: 'jing_bao_ji_jiao', text: '[劲爆] 劲爆鸡叫'},
                {value: 'wo_de_di_pan', text: '[劲爆] 我的地盘'},
                {value: 'di_yin_chao_zhen_han', text: '[劲爆] 低音超震撼'},
                {value: 'jing_dian_wu_qu', text: '[劲爆] 经典舞曲'},
                {value: 'ai_yao_tan_dang_dang', text: '[欢快] 爱要坦荡荡'},
                {value: 'chu_dian', text: '[欢快] 触电'},
                {value: 'zi_you_zhi_di', text: '[清新] 自由之地'},
                {value: 'wo_zai_na_yi_jiao_luo_huan_guo_shang_feng', text: '[清新] 我在那一角落患过伤风'},
                {value: 'la_la_la', text: '[清新] 啦拉拉'},
                {value: 'zuo_zai_xiang_kou_de_na_dui_nan_nv', text: '[清新] 坐在巷口的那对男女'},
                {value: 'ka_nong_meng_huan', text: '[舒缓] 卡农梦幻'},
                {value: 'mei_ren_yu_zhi_ge', text: '[舒缓] 美人鱼之歌'},
                {value: 'qing_cui_shui_jing_niao_jiao', text: '[舒缓] 清脆水晶鸟叫闹铃'},
                {value: 'yong_you_quan_shi_jie', text: '[其它] 拥有全世界'},
                {value: 'ai_hen_jiao_zhi', text: '[其它] 爱恨交织'},
                {value: 'gu_zhu_yi_zhi', text: '[其它] 孤注一掷'},
                {value: 'shi_wo', text: '[其它] 是我'},
                {value: 'wo_xiang_de_dao_ni_de_ai', text: '[其它] 我想得到你的爱'},
                {value: 'yun_dong_yuan_jin_xing_qu', text: '[经典] 运动员进行曲'}
            ],
            ringTimeArray: [
                {value: 0, text: '一直'},
                {value: 10, text: '10秒'},
                {value: 30, text: '30秒'},
                {value: 60, text: '1分钟'},
                {value: 300, text: '5分钟'},
                {value: 600, text: '10分钟'}
            ]
        },
        headTitle: '在线闹钟',
        timer: '',
        nowDate: null,
        settingDate: null,
        now: null,
        hour: '--',
        minute: '--',
        second: '--',
        timeRemaining: '剩余时间',
        showTimeRemaining: false,
        zhengdianBaoshi: Util.str2Bool(storage.zhengdianBaoshi),
        shangciZhengdian: null,
        music: storage.music || 'ka_nong_meng_huan',
        ringTime: Util.str2Int(storage.ringTime),
        disabled: false,
        testPlayDisabled: false,
        stopPlayDisabled: true,
        warn: false,
        warnBool: false
    },
    methods: {
        run() {
            this.buildTime();
            this.checkZhengdian();
            this.checkShengyu();
            this.checkWarn();
        },
        buildTime() {
            this.nowDate = new Date();
            this.now = Util.now(this.nowDate);
        },
        checkWarn() {
            if(!this.warn) {
                return;
            }
            this.warnBool = !this.warnBool;
            if(this.warnBool) {
                document.title = "[时间到了]";
                return;
            }
            document.title = "[一一一一]";
        },
        //判断整点报时
        checkZhengdian() {
            //未开启整点报时
            if(!this.zhengdianBaoshi) {
                return;
            }
            //分钟不为0
            if(this.nowDate.getMinutes() !== 0) {
                return;
            }
            //秒不为0
            if(this.nowDate.getSeconds() !== 0) {
                return;
            }
            //当前小时已报过时
            if(this.nowDate.getHours() === this.shangciZhengdian) {
                return;
            }
            //当前正在播放铃声时
            if(this.testPlayDisabled == true) {
                return;
            }
            Util.audio.loop = false;
            Util.audio.src = "./zhengdian/" + Util.buling(this.nowDate.getHours()) + ".ogg";
            Util.audio.play();
            this.shangciZhengdian = this.nowDate.getHours();
        },
        checkShengyu(){
            if(this.settingDate == null){
                return;
            }
            this.timeRemaining = Util.formatSeconds(this.nowDate.getTime(), this.settingDate.getTime());
            if(this.timeRemaining){
                document.title = this.timeRemaining;
                this.showTimeRemaining = true;
            } else {
                document.title = this.headTitle;
                this.showTimeRemaining = false;
                this.settingDate = null;
                this.testPlay();
                this.warn = true;
            }
        },
        timeSetting() {
            if (this.hour === "--" || this.minute === "--" || this.second === "--") {
                this.testPlayDisabled = false;
                this.stopPlayDisabled = true;
                document.title = this.headTitle;
                this.showTimeRemaining = false;
                this.settingDate = null;
                return;
            }
            this.testPlayDisabled = true;
            this.stopPlayDisabled = false;
            this.settingDate = new Date(this.nowDate.getFullYear(), this.nowDate.getMonth(), 
                                            this.nowDate.getDate(), this.hour, this.minute, this.second);
            this.checkShengyu();
        },
        quickSetting(value) {
            this.testPlayDisabled = true;
            this.stopPlayDisabled = false;
            if (this.hour === "--" || this.minute === "--" || this.second === "--") {
                this.settingDate = new Date(this.nowDate);
            } else {
                this.settingDate = new Date(this.nowDate.getFullYear(), this.nowDate.getMonth(), 
                                            this.nowDate.getDate(), this.hour, this.minute, this.second);
            }
            this.settingDate.setTime(this.settingDate.getTime() + value * 1000);
            this.hour = Util.buling(this.settingDate.getHours());
            this.minute = Util.buling(this.settingDate.getMinutes());
            this.second = Util.buling(this.settingDate.getSeconds());
            this.checkShengyu();
        },
        testPlay() {
            this.disabled = true;
            this.testPlayDisabled = true;
            this.stopPlayDisabled = false;
            Util.audio.loop = true;
            Util.audio.src = "./music/" + this.music + ".ogg";
            Util.audio.play();
            if(this.ringTime) {
                setTimeout(this.stopPlay, this.ringTime * 1000);
            }
        },
        stopPlay() {
            Util.audio.pause();
            this.warn = false;
            this.warnBool = false;
            this.hour = "--";
            this.minute = "--";
            this.second = "--";
            this.disabled = false;
            this.testPlayDisabled = false;
            this.stopPlayDisabled = true;
            document.title = this.headTitle;
            this.showTimeRemaining = false;
            this.settingDate = null;
        }
    },
    watch: {
        zhengdianBaoshi(newValue, oldValue) {
            storage.zhengdianBaoshi = newValue;
        },
        music(newValue, oldValue) {
            storage.music = newValue;
        },
        ringTime(newValue, oldValue) {
            storage.ringTime = newValue;
        }
    },
    mounted() {
        //页面初始化完成后执行逻辑，之后每500毫秒获取执行一次
        this.run();
        this.timer = setInterval(this.run,500);
    },
    beforeDestroy() {
        clearInterval(this.timer);
    }
    
})