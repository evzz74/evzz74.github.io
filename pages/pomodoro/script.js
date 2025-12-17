// 番茄时钟 JavaScript

class PomodoroTimer {
    constructor() {
        this.modes = {
            '1min': 60,      // 1分钟
            '3min': 180,     // 3分钟
            '25min': 1500    // 25分钟
        };

        this.currentMode = '1min';
        this.timeLeft = this.modes[this.currentMode];
        this.isRunning = false;
        this.interval = null;

        this.initializeElements();
        this.bindEvents();
        this.loadTheme(); // 加载保存的主题
        this.updateDisplay();
    }
    
    initializeElements() {
        // 时间显示
        this.minutesEl = document.getElementById('minutes');
        this.secondsEl = document.getElementById('seconds');
        
        // 进度环
        this.progressCircle = document.querySelector('.progress-ring__progress');
        this.progressRadius = 90;
        this.progressCircumference = 2 * Math.PI * this.progressRadius;
        this.progressCircle.style.strokeDasharray = `${this.progressCircumference} ${this.progressCircumference}`;
        
        // 控制按钮
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        // 模式按钮
        this.modeButtons = document.querySelectorAll('.mode-btn');

        // 自定义时间控件
        this.customMinutesInput = document.getElementById('customMinutes');
        this.setCustomTimeBtn = document.getElementById('setCustomTime');

        // 主题切换按钮
        this.themeButtons = document.querySelectorAll('.theme-btn');

        // 弹窗
        this.modal = document.getElementById('rewardModal');
        this.closeModalBtn = document.querySelector('.close-btn');
        this.continueBtn = document.getElementById('continueBtn');
        this.takeBreakBtn = document.getElementById('takeBreakBtn');

        // 确认弹窗
        this.confirmModal = document.getElementById('confirmModal');
        this.confirmMessage = document.getElementById('confirmMessage');
        this.confirmYesBtn = document.getElementById('confirmYes');
        this.confirmNoBtn = document.getElementById('confirmNo');
        this.pendingAction = null; // 存储待确认的操作
    }
    
    bindEvents() {
        // 控制按钮事件
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // 模式切换事件
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const time = e.currentTarget.dataset.time;
                const mode = time === '1' ? '1min' : time === '3' ? '3min' : '25min';
                this.switchMode(mode);
            });
        });

        // 自定义时间设置事件
        this.setCustomTimeBtn.addEventListener('click', () => this.setCustomTime());
        this.customMinutesInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.setCustomTime();
            }
        });

        // 主题切换事件
        this.themeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.switchTheme(theme);
            });
        });

        // 弹窗事件
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.continueBtn.addEventListener('click', () => this.continueSession());
        this.takeBreakBtn.addEventListener('click', () => this.takeBreak());

        // 确认弹窗事件
        this.confirmYesBtn.addEventListener('click', () => this.handleConfirmYes());
        this.confirmNoBtn.addEventListener('click', () => this.handleConfirmNo());

        // 点击弹窗外部关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.isRunning) {
                    this.pause();
                } else {
                    this.start();
                }
            } else if (e.code === 'KeyR') {
                e.preventDefault();
                this.reset();
            }
        });
    }
    
    switchMode(mode) {
        if (this.isRunning) {
            // 如果计时器正在运行，显示确认弹窗
            this.showConfirmDialog('切换模式', () => {
                this.pause();
                this.performSwitchMode(mode);
            });
            return;
        }

        this.performSwitchMode(mode);
    }

    performSwitchMode(mode) {
        this.currentMode = mode;
        this.timeLeft = this.modes[mode];
        this.updateDisplay();
        this.updateModeButtons();

        // 重置进度环
        this.updateProgress();
    }
    
    updateModeButtons() {
        this.modeButtons.forEach(btn => {
            const time = btn.dataset.time;
            const btnMode = time === '1' ? '1min' : time === '3' ? '3min' : '25min';
            btn.classList.toggle('active', btnMode === this.currentMode);
        });
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startBtn.style.display = 'none';
            this.pauseBtn.style.display = 'flex';
            this.pauseBtn.disabled = false;

            this.interval = setInterval(() => {
                this.tick();
            }, 1000);
        }
    }
    
    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.startBtn.style.display = 'flex';
            this.pauseBtn.style.display = 'none';
            this.pauseBtn.disabled = true;

            clearInterval(this.interval);
        }
    }
    
    reset() {
        if (this.isRunning) {
            // 如果计时器正在运行，显示确认弹窗
            this.showConfirmDialog('重置计时器', () => {
                this.performReset();
            });
            return;
        }

        this.performReset();
    }

    performReset() {
        this.pause();
        this.timeLeft = this.modes[this.currentMode];
        this.updateDisplay();
        this.updateProgress();
    }
    
    tick() {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            this.updateDisplay();
            this.updateProgress();
        } else {
            this.complete();
        }
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        this.minutesEl.textContent = minutes.toString().padStart(2, '0');
        this.secondsEl.textContent = seconds.toString().padStart(2, '0');
    }
    
    updateProgress() {
        const totalTime = this.modes[this.currentMode];
        const progress = (totalTime - this.timeLeft) / totalTime;
        const offset = this.progressCircumference * (1 - progress);
        
        this.progressCircle.style.strokeDashoffset = offset;
    }
    
    complete() {
        this.pause();
        this.showCompletionModal();

        // 播放提示音
        this.playNotificationSound();
    }
    showCompletionModal() {
        const modalTitle = document.querySelector('.modal-header h2');
        const rewardMessage = document.querySelector('.reward-message');
        const rewardSubmessage = document.querySelector('.reward-submessage');

        if (this.currentMode === '25min') {
            modalTitle.textContent = '🎉 番茄时间完成！';
            rewardMessage.textContent = '恭喜你完成了一次专注工作！';
            rewardSubmessage.textContent = '现在是休息时间，好好放松一下吧！';
        } else if (this.currentMode === '3min') {
            modalTitle.textContent = '⏰ 休息时间结束';
            rewardMessage.textContent = '短暂的休息结束了';
            rewardSubmessage.textContent = '准备好开始下一轮专注了吗？';
        } else if (this.currentMode === '1min') {
            modalTitle.textContent = '✅ 计时完成';
            rewardMessage.textContent = '1分钟时间到了！';
            rewardSubmessage.textContent = '继续加油！';
        } else if (this.currentMode.startsWith('custom')) {
            // 自定义时间完成
            const minutes = Math.floor(this.modes[this.currentMode] / 60);
            modalTitle.textContent = '🎉 专注时间完成！';
            rewardMessage.textContent = `恭喜你完成了${minutes}分钟的专注！`;
            rewardSubmessage.textContent = '坚持下去，你会更加出色！';
        } else {
            modalTitle.textContent = '✅ 计时完成';
            rewardMessage.textContent = '时间到了！';
            rewardSubmessage.textContent = '继续加油！';
        }

        this.modal.classList.add('show');

        // 添加动画效果
        setTimeout(() => {
            const trophy = document.querySelector('.trophy');
            const stars = document.querySelector('.stars');
            if (trophy) trophy.style.animation = 'bounce 1s ease infinite';
            if (stars) stars.style.animation = 'twinkle 2s ease infinite';
        }, 100);
    }
    
    closeModal() {
        this.modal.classList.remove('show');
    }
    
    continueSession() {
        this.closeModal();

        if (this.currentMode === '25min') {
            // 完成25分钟后，建议休息3分钟
            this.performSwitchMode('3min');
        } else {
            // 休息后回到25分钟模式
            this.performSwitchMode('25min');
        }

        this.start();
    }

    takeBreak() {
        this.closeModal();

        if (this.currentMode === '25min') {
            // 完成25分钟后，切换到3分钟休息
            this.performSwitchMode('3min');
            this.start();
        } else {
            // 其他模式直接重置
            this.performReset();
        }
    }
    
    playNotificationSound() {
        // 创建简单的提示音
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    // 显示确认弹窗
    showConfirmDialog(action, callback) {
        this.confirmMessage.textContent = `计时器正在运行，确定要${action}吗？当前进度将丢失。`;
        this.pendingAction = callback;
        this.confirmModal.classList.add('show');
    }

    // 处理确认"是"
    handleConfirmYes() {
        this.confirmModal.classList.remove('show');
        if (this.pendingAction) {
            this.pendingAction();
            this.pendingAction = null;
        }
    }

    // 处理确认"否"
    handleConfirmNo() {
        this.confirmModal.classList.remove('show');
        this.pendingAction = null;
    }

    // 设置自定义时间
    setCustomTime() {
        const minutes = parseInt(this.customMinutesInput.value);

        if (!minutes || minutes < 1 || minutes > 120) {
            alert('请输入1-120之间的分钟数');
            return;
        }

        if (this.isRunning) {
            // 如果计时器正在运行，显示确认弹窗
            this.showConfirmDialog('设置自定义时间', () => {
                this.applyCustomTime(minutes);
            });
            return;
        }

        this.applyCustomTime(minutes);
    }

    // 应用自定义时间
    applyCustomTime(minutes) {
        const customMode = `custom${minutes}min`;

        // 动态添加或更新自定义模式
        this.modes[customMode] = minutes * 60;
        this.currentMode = customMode;
        this.timeLeft = this.modes[customMode];

        // 清除所有模式按钮的active状态
        this.modeButtons.forEach(btn => btn.classList.remove('active'));

        // 更新显示
        this.updateDisplay();
        this.updateProgress();

        // 清空输入框
        this.customMinutesInput.value = '';

        console.log(`Custom time set: ${minutes} minutes`);
    }

    // 切换主题
    switchTheme(theme) {
        // 移除所有主题按钮的active类
        this.themeButtons.forEach(btn => btn.classList.remove('active'));

        // 为当前主题按钮添加active类
        const activeBtn = document.querySelector(`.theme-btn[data-theme="${theme}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // 设置body的data-theme属性
        if (theme === 'light') {
            document.body.removeAttribute('data-theme');
        } else {
            document.body.setAttribute('data-theme', theme);
        }

        // 保存主题选择到localStorage
        localStorage.setItem('pomodoroTheme', theme);

        console.log(`Theme switched to: ${theme}`);
    }

    // 加载保存的主题
    loadTheme() {
        // 从localStorage读取保存的主题，默认为light
        const savedTheme = localStorage.getItem('pomodoroTheme') || 'light';
        this.switchTheme(savedTheme);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});

// 添加页面可见性API支持
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 页面隐藏时，可以暂停计时器（可选）
        // 这里保持当前行为，让用户自己控制
    }
});

// 添加页面卸载提醒
window.addEventListener('beforeunload', (e) => {
    const timer = document.querySelector('.timer-text');
    if (timer && timer.textContent !== '25:00' && timer.textContent !== '03:00' && timer.textContent !== '01:00') {
        e.preventDefault();
        e.returnValue = '计时器正在运行，确定要离开吗？';
    }
});
