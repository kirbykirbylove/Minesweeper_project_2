// GameManager.ts
import { _decorator, Component, Node, Prefab, instantiate, Label, Button, Vec3, tween, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Prefab)
    sheepPrefab: Prefab = null;
    @property(Node)
    sheepContainer: Node = null;
    @property(Label)
    multiplierLabel: Label = null;
    @property(Label)
    roundLabel: Label = null;
    @property(Button)
    resetButton: Button = null;
    @property(Node)
    multiplierStar: Node = null;
    @property(Node)
    roundStar: Node = null;

    private sheep: Node[] = [];
    private gameData = ['+2', '+1', 'x1', 'x1', '+2', 'x1', 'x1', 'END', '+2', '+2', 'x1', '+2', '+2', '+2', '+2'];
    private shuffledData: string[] = [];
    private currentIndex = 0;
    private multiplier = 1;
    private round = 1;
    private gameEnded = false;

    protected onLoad() {
        this.initGame();
        this.resetButton.node.on('click', this.resetGame, this);
    }

    private initGame() {
        this.shuffleData();
        this.createSheep();
        this.resetGameState();
    }

    private shuffleData() {
        this.shuffledData = [...this.gameData].sort(() => Math.random() - 0.5);
        this.currentIndex = 0;
    }

    private createSheep() {
        this.sheep = [];
        const SPACING = 150;
        
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 5; c++) {
                const sheep = instantiate(this.sheepPrefab);
                sheep.setPosition((c - 2) * SPACING, (1 - r) * SPACING, 0);
                this.sheepContainer.addChild(sheep);
                sheep.getComponent('Sheep')?.init(r * 5 + c, this);
                this.sheep.push(sheep);}
        }
    }

    private resetGameState() {
        this.multiplier = 1;
        this.round = 1;
        this.gameEnded = false;
        this.updateLabels();
        this.sheep.forEach(s => s.getComponent('Sheep')?.reset());
    }

    private updateLabels() {
        this.multiplierLabel.string = `${this.multiplier}`;
        this.multiplierLabel.node.setSiblingIndex(1);
        this.roundLabel.string = `${this.round}`;
        this.roundLabel.node.setSiblingIndex(1);
    }

    public async onSheepClick(event: any, indexStr: string) {
        const idx = Number(indexStr);
        if (this.gameEnded || isNaN(idx)) return;

        const sheep = this.sheep[idx];
        const sheepScript = sheep?.getComponent('Sheep');
        if (!sheepScript || sheepScript.isClicked) return;

        sheepScript.isClicked = true;
        await sheepScript.playJumpAndSetJump2Frame();

        const reward = this.shuffledData[this.currentIndex++];
        sheepScript.showReward(reward);

        if (reward !== 'END') {
            this.playStarEffect(sheepScript.starNode);
            this.updateGameValues(reward);
        } else {
            this.endGame(sheep);
        }
    }

    private updateGameValues(reward: string) {
        if (reward.startsWith('x')) {
            this.multiplier += parseInt(reward.substring(1)) || 0;
            this.playStarEffect(this.multiplierStar);
        } else if (reward.startsWith('+')) {
            this.round += parseInt(reward.substring(1)) || 0;
            this.playStarEffect(this.roundStar);
        }
        this.updateLabels();
    }

    private endGame(clickedSheep: Node) {
        this.gameEnded = true;
        const remaining = this.sheep.filter(s => s !== clickedSheep && !s.getComponent('Sheep')?.isClicked);
        remaining.forEach(s => {
            const reward = this.shuffledData[this.currentIndex++] || '+0';
            s.getComponent('Sheep')?.forceReveal(reward);
        });
    }

    private resetGame() {
        this.shuffleData();
        this.resetGameState();
    }

    private async playStarEffect(target: Node): Promise<void> {
        if (!target) return;

        target.active = true;
        const opacity = target.getComponent(UIOpacity) || target.addComponent(UIOpacity);
        opacity.opacity = 0;
        target.setScale(0.1, 0.1, 1);

        return new Promise<void>(resolve => {
            tween(opacity)
                .to(0.1, { opacity: 230 })
                .call(() => {
                    tween(target)
                        .to(0.1, { scale: new Vec3(1.1, 1.1, 1) })
                        .to(0.1, { scale: new Vec3(1.1, 1.1, 1) })
                        .call(() => {
                            tween(opacity)
                                .delay(0.1)
                                .to(0.1, { opacity: 0 })
                                .call(() => {
                                    target.active = false;
                                    resolve();
                                })
                                .start();
                        })
                        .start();
                })
                .start();
        });
    }
}

// // GameManager.ts
// import { _decorator, Component, Node, Prefab, instantiate, Label, Button, Vec3, tween, UIOpacity, Color } from 'cc';
// const { ccclass, property } = _decorator;

// @ccclass('GameManager')
// export class GameManager extends Component {
//     @property(Prefab)
//     sheepPrefab: Prefab = null;
//     @property(Node)
//     sheepContainer: Node = null;
//     @property(Label)
//     multiplierLabel: Label = null;
//     @property(Label)
//     roundLabel: Label = null;
//     @property(Button)
//     resetButton: Button = null;
//     @property(Node)
//     multiplierStar: Node = null;
//     @property(Node)
//     roundStar: Node = null;

//     private sheepArray: Node[] = [];
//     private gameData: string[] = ['+2', '+1', 'x1', 'x1', '+2', 'x1', 'x1', 'END', '+2', '+2', 'x1', '+2', '+2', '+2', '+2'];
//     private shuffledData: string[] = [];
//     private currentIndex: number = 0;
//     private multiplierValue: number = 1;
//     private roundValue: number = 1;
//     private gameEnded: boolean = false;

//     protected onLoad() {
//         this.initGame();
//         this.resetButton.node.on('click', this.onResetClick, this);
//     }

//     private initGame() {
//         this.shuffleData();
//         this.createSheep();
//         this.resetGameState();
//     }

//     private shuffleData() {
//         this.shuffledData = [...this.gameData].sort(() => Math.random() - 0.5);
//         this.currentIndex = 0;
//     }

//     private createSheep() {
//         this.sheepArray = [];
//         const ROWS = 3, COLS = 5, SPACING = 150;

//         for (let r = 0; r < ROWS; r++) {
//             for (let c = 0; c < COLS; c++) {
//                 const sheep = instantiate(this.sheepPrefab);
//                 sheep.setPosition((c - 2) * SPACING, (1 - r) * SPACING, 0);
//                 this.sheepContainer.addChild(sheep);
//                 sheep.getComponent('Sheep')?.init(r * 5 + c, this);
//                 this.sheepArray.push(sheep);
//             }
//         }
//     }

//     private resetGameState() {
//         this.multiplierValue = 1;
//         this.roundValue = 1;
//         this.gameEnded = false;
//         this.updateLabels();
//         this.sheepArray.forEach(s => s.getComponent('Sheep')?.reset());
//     }

//     private updateLabels() {
//         this.multiplierLabel.string = `${this.multiplierValue}`;
//         this.multiplierLabel.node.setSiblingIndex(1);
//         this.roundLabel.string = `${this.roundValue}`;
//         this.roundLabel.node.setSiblingIndex(1);
//     }

//     public async onSheepClick(event: any, indexStr: string) {
//         const idx = Number(indexStr);
//         if (this.gameEnded || isNaN(idx)) return;

//         const sheep = this.sheepArray[idx];
//         const sheepScript = sheep?.getComponent('Sheep');
//         if (!sheepScript || sheepScript.isClicked) return;

//         sheepScript.isClicked = true;
//         await sheepScript.playJumpAndSetJump2Frame();

//         const reward = this.shuffledData[this.currentIndex++];
//         sheepScript.showReward(reward);

//         // 點擊的小羊顯示星星動畫（END除外）
//         if (reward !== 'END') this.playStarEffect(sheepScript.starNode);

//         if (reward === 'END') {
//             this.gameEnded = true;
//             // await sheepScript.playDownAnimation();
//             // END後其他小羊立即顯示剩餘獎勵，不播放星星動畫
//             const remainingSheep = this.sheepArray.filter(s => s !== sheep && !s.getComponent('Sheep')?.isClicked);
//             remainingSheep.forEach((s) => {
//                 const sScript = s.getComponent('Sheep');
//                 const rewardData = this.shuffledData[this.currentIndex++] || '+0';
//                 sScript.forceReveal(rewardData); // forceReveal 會自動變黑
//             });
//         } else {
//             this.updateGameValues(reward, sheepScript.starNode);
//         }
//     }

//     private async updateGameValues(rewardData: string, starNode?: Node): Promise<void> {
//         if (rewardData.startsWith('x')) {
//             this.multiplierValue += parseInt(rewardData.substring(1)) || 0;
//             await this.playStarEffect(this.multiplierStar);
//         } else if (rewardData.startsWith('+')) {
//             this.roundValue += parseInt(rewardData.substring(1)) || 0;
//             await this.playStarEffect(this.roundStar);
//         }
//         this.updateLabels();
//     }

//     private onResetClick() {
//         this.shuffleData();
//         this.resetGameState();
//     }

//     private async playStarEffect(target: Node, skipForEnd: boolean = false): Promise<void> {
//     if (!target || (skipForEnd && this.gameEnded)) return;

//     target.active = true;
//     const uiOpacity = target.getComponent(UIOpacity) || target.addComponent(UIOpacity);
//     uiOpacity.opacity = 0;
//     target.setScale(0.1, 0.1, 1);

//     return new Promise<void>((resolve) => {
//         tween(uiOpacity)
//             .to(0.1, { opacity: 230 })
//             .call(() => {
//                 tween(target)
//                     .to(0.1, { scale: new Vec3(1.1, 1.1, 1) })
//                     .to(0.1, { scale: new Vec3(1.1, 1.1, 1) })
//                     .call(() => {
//                         tween(uiOpacity)
//                             .delay(0.1)
//                             .to(0.1, { opacity: 0 })
//                             .call(() => {
//                                 target.active = false;
//                                 resolve();
//                             })
//                             .start();
//                     })
//                     .start();
//             })
//             .start();
//     });
// }
// }
