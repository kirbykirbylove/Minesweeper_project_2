// Sheep.ts
import { _decorator, Component, Node, Sprite, Label, Button, Color, Animation, UIOpacity, LabelOutline, EventHandler, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Sheep')
export class Sheep extends Component {
    @property(Sprite)
    sheepSprite: Sprite = null;
    @property(Label)
    rewardLabel: Label = null;
    @property(Button)
    button: Button = null;
    @property(Node)
    starNode: Node = null;
    @property(SpriteFrame)
    run0Frame: SpriteFrame = null;
    @property(SpriteFrame)
    jump2Frame: SpriteFrame = null;

    public isClicked = false;
    private index = 0;
    private gameManager: any = null;

    public init(index: number, manager: any) {
        this.index = index;
        this.gameManager = manager;
        this.setupButton();
        this.reset();
    }

    private setupButton() {
        if (!this.button) return;
        this.button.clickEvents = [];
        const handler = new EventHandler();
        handler.target = this.gameManager.node;
        handler.component = 'GameManager';
        handler.handler = 'onSheepClick';
        handler.customEventData = this.index.toString();
        this.button.clickEvents.push(handler);
    }

    public reset() {
        this.isClicked = false;
        this.node.active = true;
        this.sheepSprite.color = Color.WHITE;
        if (this.rewardLabel) { this.rewardLabel.node.active = false; this.rewardLabel.string = ''; }
        if (this.starNode) { this.starNode.active = false; (this.starNode.getComponent(UIOpacity) || this.starNode.addComponent(UIOpacity)).opacity = 0; }
        this.button.interactable = true;
        this.startRunAnimation();
    }

    private startRunAnimation() {
        if (this.isClicked) return;
        const anim = this.node.getChildByName('SheepSprite')?.getComponent(Animation);
        if (anim) { anim.stop(); anim.play('run'); }
    }

    public playJumpAndSetJump2Frame(): Promise<void> {
        return new Promise(resolve => {
            const sprite = this.node.getChildByName('SheepSprite')?.getComponent(Sprite);
            const anim = this.node.getChildByName('SheepSprite')?.getComponent(Animation);
            const setFrame = () => { 
                if (sprite && this.jump2Frame) sprite.spriteFrame = this.jump2Frame; 
                resolve(); 
            };
            if (anim) { anim.stop(); anim.play('jump'); anim.once('finished', setFrame, this); this.scheduleOnce(setFrame, 1); }
            else setFrame();
        });
    }

    public playDownAnimation(): Promise<void> {
        return new Promise(resolve => {
            const anim = this.node.getChildByName('SheepSprite')?.getComponent(Animation);
            if (!anim) { resolve(); return; }
            anim.stop(); anim.play('down');
            const onFinish = () => { anim.off('finished', onFinish); resolve(); };
            anim.once('finished', onFinish); this.scheduleOnce(onFinish, 0.8);
        });
    }

    public showReward(reward: string, showStar = true) {
        if (this.rewardLabel) {
            this.rewardLabel.string = reward;
            this.rewardLabel.node.active = true;
            this.rewardLabel.color = this.getColor(reward);
            this.rewardLabel.node.setSiblingIndex(-1);
            const outline = this.rewardLabel.getComponent(LabelOutline) || this.rewardLabel.node.addComponent(LabelOutline);
            outline.color = new Color(0, 0, 0, 235);
            outline.width = 1;
        }

        if (this.starNode) {
            this.starNode.active = showStar && reward !== 'END';
            if (this.starNode.active) {
                const uiOpacity = this.starNode.getComponent(UIOpacity) || this.starNode.addComponent(UIOpacity);
                uiOpacity.opacity = 0;
                this.starNode.setScale(0.5, 0.5, 1);
            }
        }
    }

    private getColor(reward: string) {
        if (reward === 'END') return Color.RED;
        if (reward.startsWith('x')) return Color.YELLOW;
        if (reward.startsWith('+')) return Color.BLUE;
        return Color.WHITE;
    }

    public darken() { 
        if (this.sheepSprite) this.sheepSprite.color = new Color(100, 100, 100, 255); 
        if (this.button) this.button.interactable = false; 
    }

    public forceReveal(reward: string) { 
        this.isClicked = true; 
        this.darken(); 
        this.showReward(reward, false); 
        this.playDownAnimation(); 
    }
}


// // Sheep.ts
// import { _decorator, Component, Node, Sprite, Label, Button, Color, Animation, UIOpacity, Vec3, LabelOutline, EventHandler, SpriteFrame } from 'cc';
// const { ccclass, property } = _decorator;

// @ccclass('Sheep')
// export class Sheep extends Component {
//     @property(Sprite)
//     sheepSprite: Sprite = null;
//     @property(Label)
//     rewardLabel: Label = null;
//     @property(Button)
//     button: Button = null;
//     @property(Node)
//     starNode: Node = null;
//     @property(SpriteFrame)
//     run0Frame: SpriteFrame = null;
//     @property(SpriteFrame)
//     jump2Frame: SpriteFrame = null;

//     public isClicked = false;
//     private sheepIndex = 0;
//     private gameManager: any = null;
//     private shouldStayAtJump2 = false;

//     public init(index: number, manager: any) {
//         this.sheepIndex = index;
//         this.gameManager = manager;
//         this.setupButton();
//         this.reset();
//     }

//     private setupButton() {
//         if (!this.button) return;
//         this.button.clickEvents = [];
//         const handler = new EventHandler();
//         handler.target = this.gameManager.node;
//         handler.component = 'GameManager';
//         handler.handler = 'onSheepClick';
//         handler.customEventData = this.sheepIndex.toString();
//         this.button.clickEvents.push(handler);
//     }

//     public reset() {
//         this.isClicked = false;
//         this.shouldStayAtJump2 = false;
//         this.node.active = true;
//         this.sheepSprite.color = Color.WHITE;
//         if (this.rewardLabel) { this.rewardLabel.node.active = false; this.rewardLabel.string = ''; }
//         if (this.starNode) { this.starNode.active = false; (this.starNode.getComponent(UIOpacity) || this.starNode.addComponent(UIOpacity)).opacity = 0; }
//         this.button.interactable = true;
//         this.startRunAnimation();
//     }

//     private startRunAnimation() {
//         if (this.isClicked || this.shouldStayAtJump2) return;
//         const anim = this.node.getChildByName('SheepSprite')?.getComponent(Animation);
//         if (anim) { anim.stop(); anim.play('run'); }
//         // else if (this.sheepSprite && this.run0Frame) this.sheepSprite.spriteFrame = this.run0Frame;
//     }

//     public playJumpAndSetJump2Frame(): Promise<void> {
//         return new Promise(resolve => {
//             const sprite = this.node.getChildByName('SheepSprite')?.getComponent(Sprite);
//             const anim = this.node.getChildByName('SheepSprite')?.getComponent(Animation);
//             const setFrame = () => { if (sprite && this.jump2Frame) sprite.spriteFrame = this.jump2Frame; this.shouldStayAtJump2 = true; resolve(); };
//             if (anim) { anim.stop(); anim.play('jump'); anim.once('finished', setFrame, this); this.scheduleOnce(setFrame, 1); }
//             else setFrame();
//         });
//     }

//     public playDownAnimation(): Promise<void> {
//         return new Promise(resolve => {
//             const anim = this.node.getChildByName('SheepSprite')?.getComponent(Animation);
//             // if (!anim) { resolve(); return; }
//             anim.stop(); anim.play('down');
//             const onFinish = () => { anim.off('finished', onFinish); resolve(); };
//             anim.once('finished', onFinish); this.scheduleOnce(onFinish, 0.8);
//         });
//     }

//     public showReward(reward: string, showStar = true) {
//         if (this.rewardLabel) {
//             this.rewardLabel.string = reward;
//             this.rewardLabel.node.active = true;
//             this.rewardLabel.color = this.getColor(reward);
//             this.rewardLabel.node.setSiblingIndex(-1);

//             let outline = this.rewardLabel.getComponent(LabelOutline) || this.rewardLabel.node.addComponent(LabelOutline);
//             outline.color = new Color(0, 0, 0, 235);
//             outline.width = 1;
//         }

//         if (this.starNode) {
//             this.starNode.active = showStar && reward !== 'END';
//             if (this.starNode.active) {
//                 const uiOpacity = this.starNode.getComponent(UIOpacity) || this.starNode.addComponent(UIOpacity);
//                 uiOpacity.opacity = 0;
//                 this.starNode.setScale(0.5, 0.5, 1);
//             }
//         }
//     }

//     private getColor(reward: string) {
//         if (reward === 'END') return Color.RED;
//         if (reward.startsWith('x')) return Color.YELLOW;
//         if (reward.startsWith('+')) return Color.BLUE;
//         return Color.WHITE;
//     }

//     public darken() { if (this.sheepSprite) this.sheepSprite.color = new Color(100, 100, 100, 255); if (this.button) this.button.interactable = false; }

//     public forceReveal(reward: string) { this.isClicked = true; this.darken(); this.showReward(reward, false); this.playDownAnimation(); }
// }

