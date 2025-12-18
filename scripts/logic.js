/**
 * RPG Map System - Logic Controller
 * 負責管理座標同步與 ST 交互
 */

(function() {
    console.log("[RPG System] 邏輯腳本載入中...");

    // === 1. 核心：更新視覺 (修改 CSS 變量) ===
    window.updateRpgMap = function(x, y) {
        // x, y 預期為百分比 (0-100)
        // 為了防呆，確保輸入是數字
        const safeX = parseFloat(x) || 50;
        const safeY = parseFloat(y) || 50;

        const body = document.body;
        body.style.setProperty('--rpg-x', safeX + '%');
        body.style.setProperty('--rpg-y', safeY + '%');
        
        console.log(`[RPG System] 紅點已更新至: ${safeX}%, ${safeY}%`);
    };

    // === 2. 傳送功能 (給地圖按鈕呼叫) ===
    window.rpgTeleport = async function(locationName, x, y) {
        // A. 立即更新視覺 (讓玩家覺得反應很快)
        window.updateRpgMap(x, y);

        // B. 通知 SillyTavern (透過 Slash Command)
        // 這會更新 LittleWhiteBox 變量，並發送系統訊息
        const commands = [
            `/setvar key=current_x ${x}`,
            `/setvar key=current_y ${y}`,
            `/setvar key=location_name ${locationName}`,
            // 發送一條系統提示 (可選)
            `/sys 玩家使用了傳送法術，瞬間移動到了${locationName}。`
        ];

        // 執行指令
        if (window.executeSlashCommands) {
            await window.executeSlashCommands(commands.join(' | '));
        } else {
            console.warn("[RPG System] 無法連接 ST 指令接口");
        }
    };

    // === 3. 初始化 (恢復記憶) ===
    // 當腳本載入時，嘗試從 LittleWhiteBox 讀取上次的位置
    function initState() {
        // 檢查是否有 ST 的變量獲取函數
        // 注意：getVar 是 ST 的內部函數，可能需要透過 context 存取
        // 這裡使用一種通用的容錯寫法
        
        let lastX = 50;
        let lastY = 50;

        // 嘗試讀取 HTML 中的變量 (如果 LWB 有注入的話)
        // 或者您可以在角色卡 First Message 預先定義變量
        if (window.SillyTavern && window.SillyTavern.getContext) {
            const context = window.SillyTavern.getContext();
            if (context.variables) {
                lastX = context.variables.current_x || 50;
                lastY = context.variables.current_y || 50;
            }
        }
        
        // 執行一次更新，確保紅點在正確位置
        window.updateRpgMap(lastX, lastY);
        console.log("[RPG System] 初始化完成，座標還原");
    }

    // 延遲執行初始化，確保 ST 環境就緒
    setTimeout(initState, 1000);

})();