var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

const TILE_SIZE = 16; // 타일의 크기
const PLATFORM_COUNT = 1; // 한 번에 생성할 플랫폼 개수
const PLATFORM_WIDTH = TILE_SIZE * 2; // 플랫폼의 폭 (2x2로 설정)
const PLATFORM_HEIGHT = TILE_SIZE * 2; // 플랫폼의 높이 (2x2로 설정)
const INITIAL_TILE_AREA = 10;
const PLATFORM_CHANCE = 0.0025; // 타일 대신 플랫폼이 생성될 확률 
const STAR_CHANCE = 0.05; // 별이 생성될 확률 (5%)

// var game = new Phaser.Game(config);
let initialTileGroup; // 전역으로 선언

let collectedStars = 0; // 수집한 별의 개수 추적

let leftTileGenerated = false;
let rightTileGenerated = false;
let upTileGenerated = false;
let downTileGenerated = false;

let generatedStars = new Set(); // 생성된 별의 위치를 추적할 Set
const generatedPlatforms = new Set(); // 생성된 플랫폼 추적
const generatedTiles = new Set(); // 생성된 타일의 위치를 추적합니다.
const MAX_TILES = 2000; // 최대 타일 수 제한
let playerNickname = ''; // 플레이어 닉네임을 저장할 변수

function startGame() {
    // 로컬 스토리지에서 닉네임을 가져옴
    let savedNickname = localStorage.getItem('playerNickname');

    if (!savedNickname) {
        // 닉네임이 저장되어 있지 않으면 입력 받음
        savedNickname = prompt('Enter your nickname to start the game: 20글자 제한');

        if (savedNickname.length > 20) {
            savedNickname = savedNickname.substring(0, 10);
        }
        
        // 닉네임이 입력되지 않았거나 공백일 경우 재입력 요청
        while (savedNickname === null || savedNickname.trim() === '') {
            alert('Nickname is required to start the game.');
            savedNickname = prompt('Enter your nickname to start the game:');
        }

        // 입력받은 닉네임을 로컬 스토리지에 저장
        localStorage.setItem('playerNickname', savedNickname);
    }

    // 닉네임이 설정되면 게임을 시작
    playerNickname = savedNickname;
    
    // 게임을 본격적으로 시작 (닉네임이 입력된 후에만 create 함수를 호출)
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: 'game-container',
        physics: {
            default: 'arcade',
            arcade: {
                debug: false
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    const game = new Phaser.Game(config);
}

startGame();

function preload ()
{   
    // 기본 에셋들
    // this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/BulletB2.png');
    // this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });

    // 추가한 에셋
    this.load.image('grass1', 'assets/grass1.png');
    this.load.image('grass2', 'assets/grass2.png');
    this.load.image('grass3', 'assets/grass3.png');

    this.load.image('platform1', 'assets/platform1.png');
    this.load.image('platform2', 'assets/platform2.png');
    this.load.image('platform3', 'assets/platform3.png');
    
    randomCharacterIndex = Phaser.Math.Between(1, 12);

    this.load.spritesheet('player', `assets/char${randomCharacterIndex}.png`, {
        frameWidth: 32,  // 각 프레임의 가로 크기
        frameHeight: 36  // 각 프레임의 세로 크기
    });
}



function create ()
{
    const tileWidth =16;
    const tileHeight = 16;
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    generatedTiles.clear();
    initialTileGroup = this.add.group();

    bombCountText = this.add.text(780, 16, 'Bombs: 0', { fontSize: '32px', fill: '#fff' });
    bombCountText.setScrollFactor(0); // 스크롤에 영향을 받지 않도록 설정
    bombCountText.setOrigin(1, 0); // 오른쪽 위 구석에 정렬
    bombCountText.setDepth(1000); // 모든 오브젝트 위에 표시
    

    // for (let x = 0; x < INITIAL_TILE_AREA; x++) {
    //     for (let y = 0; y < INITIAL_TILE_AREA; y++) {
    //         const tile = this.add.image(x * TILE_SIZE, y * TILE_SIZE, 'grass').setOrigin(0);
    //         initialTileGroup.add(tile); // 그룹에 타일 추가
    //     }
    // }

    generateInitialTilesInCameraView.call(this);

    // player = this.physics.add.sprite(screenWidth / 2, screenHeight / 2, 'dude');

    player = this.physics.add.sprite(screenWidth / 2, screenHeight / 2, 'player');
    // this.player.play('walk'); // 애니메이션 재생
    
    this.cameras.main.startFollow(player, true, 0.1, 0.1);
    // this.cameras.main.setDeadzone(screenWidth / 2, screenHeight / 2); // 캐릭터가 중앙에 고정
    // this.cameras.main.setBounds(0, 0, 1000, 1000); // 카메라의 이동 범위 설정

    // 입력 설정
    // this.cursors = this.input.keyboard.createCursorKeys();

    //  A simple background for our game
    // this.add.image(400, 300, 'sky');
    
    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();


    //랜덤생성 담당 함수
    initialTileGeneration.call(this, this.cameras.main.worldView);
    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    // platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    //  Now let's create some ledges
    // platforms.create(600, 400, 'ground');
    // platforms.create(50, 250, 'ground');
    // platforms.create(750, 220, 'ground');

    // The player and its settings
    // player = this.physics.add.sprite(100, 450, 'dude');

    //  Player physics properties. Give the little guy a slight bounce.
    // player.setBounce(0.2);
    // player.setCollideWorldBounds(true);

    //  Our player animations, turning, walking left and walking right.
    // this.anims.create({
    //     key: 'left',
    //     frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    //     frameRate: 10,
    //     repeat: -1
    // });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'player', frame: 7 } ],
        frameRate: 20
    });

    // this.anims.create({
    //     key: 'right',
    //     frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    //     frameRate: 10,
    //     repeat: -1
    // });

    this.anims.create({
        key: 'left',
        frames: [
            { key: 'player', frame: 9 }, // 1번 프레임
            { key: 'player', frame: 10 }, // 2번 프레임
            { key: 'player', frame: 11 }, // 3번 프레임
            { key: 'player', frame: 10 }, // 2번 프레임
            { key: 'player', frame: 9 }  // 1번 프레임
        ],
        frameRate: 10,
        repeat: -1 // 무한 반복
    });
    
    this.anims.create({
        key: 'right',
        frames: [
            { key: 'player', frame: 3 }, // 1번 프레임
            { key: 'player', frame: 4 }, // 2번 프레임
            { key: 'player', frame: 5 }, // 3번 프레임
            { key: 'player', frame: 4 }, // 2번 프레임
            { key: 'player', frame: 3 }  // 1번 프레임
        ],
        frameRate: 10,
        repeat: -1
    });
    
    this.anims.create({
        key: 'up',
        frames: [
            { key: 'player', frame: 0 }, // 1번 프레임
            { key: 'player', frame: 1 }, // 2번 프레임
            { key: 'player', frame: 2 }, // 3번 프레임
            { key: 'player', frame: 1 }, // 2번 프레임
            { key: 'player', frame: 0 }  // 1번 프레임
        ],
        frameRate: 10,
        repeat: -1
    });
    
    this.anims.create({
        key: 'down',
        frames: [
            { key: 'player', frame: 6 }, // 1번 프레임
            { key: 'player', frame: 7 }, // 2번 프레임
            { key: 'player', frame: 8 }, // 3번 프레임
            { key: 'player', frame: 7 }, // 2번 프레임
            { key: 'player', frame: 6 }  // 1번 프레임
        ],
        frameRate: 10,
        repeat: -1
    });
    

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    generateRandomStars.call(this, 12); // 별 12개 생성

    bombs = this.physics.add.group({
        bounceX: 1,
        bounceY: 1
    });

    //  The score
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#fff' });
    scoreText.setScrollFactor(0);
    scoreText.setDepth(1000); // 높은 depth 값으로 설정하여 모든 오브젝트 위에 표시

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(player, stars, collectStar, null, this);

    this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function generateRandomStars(count) {
    stars = this.physics.add.group();

    for (let i = 0; i < count; i++) {
        // 별의 X, Y 위치를 무작위로 설정 (맵의 넓은 범위 내에서)
        const x = Phaser.Math.Between(0, 1000); // 0부터 2000까지의 X 위치에서 생성
        const y = Phaser.Math.Between(0, 1000); // 0부터 2000까지의 Y 위치에서 생성
        const star = stars.create(x, y, 'star');
        
    }
}

function generateInitialTilesInCameraView() {
    const view = this.cameras.main.worldView; // 현재 카메라가 보는 뷰
    const tileWidth = 16;
    const tileHeight = 16;

    // 카메라 뷰 안에서 타일 생성 (한 타일 더 확장)
    for (let x = Math.floor(view.left / tileWidth) * tileWidth - tileWidth; x < view.right + tileWidth; x += tileWidth) {
        for (let y = Math.floor(view.top / tileHeight) * tileHeight - tileHeight; y < view.bottom + tileHeight; y += tileHeight) {
            const tileKey = `${x},${y}`; // 타일의 좌표 키 생성

            // 타일이 아직 생성되지 않았을 경우에만 생성
            if (!generatedTiles.has(tileKey)) {
                // 랜덤 타일 선택 로직
                const tileType = Phaser.Math.Between(1, 100);
                let tileTexture = 'grass1';
                
                if (tileType <= 3) {
                    tileTexture = 'grass3'; // 1% 확률로 grass3
                } else if (tileType <= 25) {
                    tileTexture = 'grass2'; // 20% 확률로 grass2
                }

                const tile = this.add.image(x, y, tileTexture).setOrigin(0);
                tile.setDepth(-1); // 다른 오브젝트 아래에 그려지도록 깊이 설정
                initialTileGroup.add(tile); // 그룹에 타일 추가
                generatedTiles.add(tileKey); // 생성된 타일 기록
            }
        }
    }
}


// 행동관련 코드
function update ()
{
    if (gameOver)
    {
        displayGameOverUI.call(this); // 게임 오버 UI 표시 함수 호출
        return;
    }

    const speed = 160; // 기본 이동 속도
    let velocityX = 0;
    let velocityY = 0;

    if (cursors.left.isDown) {
        velocityX = -speed;
    }
    else if (cursors.right.isDown) {
        velocityX = speed;
    }

    if (cursors.up.isDown) {
        velocityY = -speed;
    }
    else if (cursors.down.isDown) {
        velocityY = speed;
    }

    // 대각선 이동 속도 보정
    if (velocityX !== 0 && velocityY !== 0) {
        const diagonalSpeed = speed / Math.sqrt(2); // 대각선 속도 보정
        velocityX = velocityX > 0 ? diagonalSpeed : -diagonalSpeed;
        velocityY = velocityY > 0 ? diagonalSpeed : -diagonalSpeed;
    }

    player.setVelocityX(velocityX);
    player.setVelocityY(velocityY);

    // 애니메이션 적용
    if (velocityX < 0) {
        if (!player.anims.currentAnim || player.anims.currentAnim.key !== 'left') {
            player.anims.play('left', true);  // 왼쪽 이동 시 'left' 애니메이션 재생
        }
    } else if (velocityX > 0) {
        if (!player.anims.currentAnim || player.anims.currentAnim.key !== 'right') {
            player.anims.play('right', true);  // 오른쪽 이동 시 'right' 애니메이션 재생
        }
    } else if (velocityY < 0) {
        if (!player.anims.currentAnim || player.anims.currentAnim.key !== 'up') {
            player.anims.play('up', true);  // 위로 이동 시 'up' 애니메이션 재생
        }
    } else if (velocityY > 0) {
        if (!player.anims.currentAnim || player.anims.currentAnim.key !== 'down') {
            player.anims.play('down', true);  // 아래로 이동 시 'down' 애니메이션 재생
        }
    } else {
        // 정지 상태에서의 애니메이션
        if (!player.anims.currentAnim || player.anims.currentAnim.key !== 'turn') {
            player.anims.play('turn'); // 정지 상태에서 'turn' 애니메이션 재생
        }
    }

    const camera = this.cameras.main;
    const view = camera.worldView;
    const maxDistance = 1500; // 5000px 이상이면 제거

    // 플레이어 위치가 한 타일 크기 이상 이동했을 때 타일 복사
    if (Math.abs(player.x - lastCopiedX) > TILE_SIZE || Math.abs(player.y - lastCopiedY) > TILE_SIZE) {
        copyInitialTileArea.call(this, view);
        lastCopiedX = player.x; 
        lastCopiedY = player.y;
    }


    //폭탄 카메라 내에서만 튕기도록 수정
    bombs.children.iterate((bomb) => {
        const camera = this.cameras.main;
        const view = camera.worldView;

        // 폭탄이 카메라 안으로 들어왔는지 체크
        if (!bomb.inCameraBounds && bomb.x >= view.left && bomb.x <= view.right && bomb.y >= view.top && bomb.y <= view.bottom) {
            bomb.inCameraBounds = true; // 카메라 안으로 들어왔을 때 플래그 설정
        }

        // 폭탄이 카메라 밖으로 나가면 제거
        if (bomb.x < view.left - 50 || bomb.x > view.right + 50 || bomb.y < view.top - 50 || bomb.y > view.bottom + 50) {
            bomb.destroy(); // 폭탄 제거
            generateBombOutsideCamera.call(this); // 새로운 폭탄 생성
        }
    });

    const currentBombCount = bombs.countActive(true);
    bombCountText.setText('Bombs: ' + currentBombCount);
    
    


}
  
let lastCopiedX = 0; // 마지막으로 복사된 타일 기준
let lastCopiedY = 0;
// const generatedTiles = new Set(); // 생성된 타일을 추적

function copyInitialTileArea(view) {
    // 타일을 카메라 뷰의 경계 바깥에서 생성
    const cameraPadding = 100;
    const startX = Math.floor((view.left - cameraPadding) / TILE_SIZE) * TILE_SIZE;
    const endX = Math.ceil((view.right + cameraPadding) / TILE_SIZE) * TILE_SIZE;
    const startY = Math.floor((view.top - cameraPadding) / TILE_SIZE) * TILE_SIZE;
    const endY = Math.ceil((view.bottom + cameraPadding) / TILE_SIZE) * TILE_SIZE;

    // 타일 생성 (카메라 뷰 밖에서만 생성)
    for (let x = startX; x <= endX; x += TILE_SIZE) {
        for (let y = startY; y <= endY; y += TILE_SIZE) {
            const tileKey = `${x},${y}`;

            // 타일이 카메라 뷰 안에 있지 않으며, 이미 생성되지 않았을 때만 생성
            if (!generatedTiles.has(tileKey) && (x < view.left || x > view.right || y < view.top || y > view.bottom)) {
                
                // grass1, grass2, grass3 중에서 랜덤으로 선택
                const randomNum = Phaser.Math.Between(1, 1000);
                let grassKey = 'grass1'; // 기본적으로 grass1을 더 많이 나타나게 설정

                if (randomNum > 740 && randomNum <= 990) { // 741~990일 때 grass2 (약 25% 확률)
                    grassKey = 'grass2';
                } else if (randomNum > 990) { // 991~1000일 때 grass3 (1% 확률)
                    grassKey = 'grass3';
                }

                // 선택된 grass 스프라이트로 타일 생성
                const newTile = this.add.image(x, y, grassKey).setOrigin(0);
                newTile.setDepth(-1); // 타일을 뒤쪽에 그리기

                // 플랫폼 생성 확률
                if (Math.random() < PLATFORM_CHANCE) {
                    const platformKey = `${x},${y}`;
                    if (!generatedPlatforms.has(platformKey)) {
                        const platformSprites = ['platform1', 'platform2', 'platform3']; // 사용할 3개의 플랫폼 스프라이트
                        const selectedPlatform = Phaser.Math.RND.pick(platformSprites); // 플랫폼 중 하나를 무작위로 선택

                        const grassBelowPlatform = this.add.image(x, y, 'grass1').setOrigin(0); // 플랫폼 밑에 깔릴 grass1
                        grassBelowPlatform.setDepth(-2); // grass1을 플랫폼 아래에 위치

                        const platform = platforms.create(x, y, selectedPlatform).setOrigin(0);
                        platform.refreshBody(); // 물리 엔진 갱신

                        generatedPlatforms.add(platformKey); // 생성된 플랫폼 위치 기록
                    }
                }

                // 별 생성 확률에 따라 별 생성
                if (Math.random() < STAR_CHANCE) {
                    const starKey = `${x},${y}`;
                    if (!generatedStars.has(starKey)) {
                        const star = stars.create(x, y, 'star');
                        star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)); // 별의 바운스 효과
                        generatedStars.add(starKey); // 별이 생성된 위치 기록
                    }
                }

                // 타일 또는 플랫폼이 생성된 좌표는 타일로 간주해 기록
                generatedTiles.add(tileKey);
            }
        }
    }
}



function initialTileGeneration(view) {
    // 초기 시작 시 타일과 플랫폼을 카메라 뷰 안쪽에도 생성
    const startX = Math.floor(view.left / TILE_SIZE) * TILE_SIZE;
    const endX = Math.ceil(view.right / TILE_SIZE) * TILE_SIZE;
    const startY = Math.floor(view.top / TILE_SIZE) * TILE_SIZE;
    const endY = Math.ceil(view.bottom / TILE_SIZE) * TILE_SIZE;

    // 타일 및 플랫폼 생성
    for (let x = startX; x <= endX; x += TILE_SIZE) {
        for (let y = startY; y <= endY; y += TILE_SIZE) {
            const tileKey = `${x},${y}`;

            if (!generatedTiles.has(tileKey)) {
                // 플랫폼을 일정 확률로 생성
                if (Math.random() < PLATFORM_CHANCE) {
                    const platformKey = `${x},${y}`;
                    if (!generatedPlatforms.has(platformKey)) {
                        const platform = platforms.create(x, y, 'ground');
                        platform.setDisplaySize(PLATFORM_WIDTH, PLATFORM_HEIGHT); // 크기 조정 (2x2)
                        platform.refreshBody(); // 물리 엔진 갱신
                        generatedPlatforms.add(platformKey); // 생성된 플랫폼 위치 기록
                    }
                } else {
                    // 타일 생성
                    const newTile = this.add.image(x, y, 'grass').setOrigin(0);
                    newTile.setDepth(-1); // 타일을 뒤쪽에 그리기
                }

                generatedTiles.add(tileKey); // 타일 또는 플랫폼 위치 기록
            }
        }
    }
}


// 별모아서 점수먹는 함수
function collectStar(player, star) {
    star.disableBody(true, true);

    // 점수를 증가시키고 화면에 표시
    score += 10;
    scoreText.setText('Score: ' + score);

    collectedStars++; // 수집한 별 개수 증가

    // 3개의 별을 먹을 때마다 총알을 추가 생성
    if (collectedStars >= 3) {
        manageBombsBasedOnScore.call(this);// 점수에 맞춰 총알 생성
        collectedStars = 0; // 별 카운트 초기화
    }
}


function generateBombOutsideCamera() {
    const camera = this.cameras.main;
    const view = camera.worldView;

    // 사방에서 무작위로 폭탄 생성
    let x, y;

    // 4가지 방향에서 생성: 위, 아래, 왼쪽, 오른쪽
    const side = Phaser.Math.Between(0, 3); // 0: 위, 1: 아래, 2: 왼쪽, 3: 오른쪽

    switch (side) {
        case 0: // 위쪽
            x = Phaser.Math.Between(view.left - 300, view.right + 300); // 카메라 범위의 좌우로 랜덤
            y = view.top - Phaser.Math.Between(50, 300); // 카메라 위쪽에 생성
            break;
        case 1: // 아래쪽
            x = Phaser.Math.Between(view.left - 300, view.right + 300); // 카메라 범위의 좌우로 랜덤
            y = view.bottom + Phaser.Math.Between(50, 300); // 카메라 아래쪽에 생성
            break;
        case 2: // 왼쪽
            x = view.left - Phaser.Math.Between(50, 300); // 카메라 왼쪽에 생성
            y = Phaser.Math.Between(view.top - 300, view.bottom + 300); // 카메라 범위의 상하로 랜덤
            break;
        case 3: // 오른쪽
            x = view.right + Phaser.Math.Between(50, 300); // 카메라 오른쪽에 생성
            y = Phaser.Math.Between(view.top - 300, view.bottom + 300); // 카메라 범위의 상하로 랜덤
            break;
    }

    var bomb = bombs.create(x, y, 'bomb');
    bomb.setBounce(1);
    bomb.setAngularVelocity(200);

    // 폭탄이 카메라 중앙으로 날아오도록 속도 설정 (러프하게 100x100 범위로 오프셋)
    const offsetX = Phaser.Math.Between(-160, 160); // X축 오프셋
    const offsetY = Phaser.Math.Between(-160, 160); // Y축 오프셋
    const targetX = camera.midPoint.x + offsetX;
    const targetY = camera.midPoint.y + offsetY;

    const directionX = targetX - x;
    const directionY = targetY - y;

    // 속도 크기 조정 (200~300 범위 내)
    const magnitude = Phaser.Math.Between(100, 250);
    const normFactor = Math.sqrt(directionX * directionX + directionY * directionY);

    bomb.setVelocity((directionX / normFactor) * magnitude, (directionY / normFactor) * magnitude);
    bomb.allowGravity = false;

    // 폭탄이 카메라 안으로 들어온 후부터 카메라 경계 내에서 튕기도록 설정
    bomb.inCameraBounds = false; // 초기 상태에서는 카메라 경계 바깥에 있음
}


// 폭탄맞는 함수
function hitBomb(player, bomb) {
    this.physics.pause(); // 물리 엔진을 멈춤

    player.setTint(0xff0000); // 플레이어를 빨간색으로 변경 (게임 오버 표시)
    player.anims.play('turn');

    gameOver = true;

    // 카메라가 더 이상 플레이어를 따라가지 않도록 설정
    this.cameras.main.stopFollow();

    // 카메라를 현재 플레이어의 위치에 고정
    this.cameras.main.setScroll(player.x - this.cameras.main.width / 2, player.y - this.cameras.main.height / 2);
}


function displayGameOverUI() {
    if (this.gameOverDisplayed) {
        return;
    }
    this.gameOverDisplayed = true;

    const cameraCenterX = this.cameras.main.midPoint.x;
    const cameraCenterY = this.cameras.main.midPoint.y;

    const gameOverText = this.add.text(cameraCenterX, cameraCenterY - 100, 'Game Over', { fontSize: '64px', fill: '#fff' });
    gameOverText.setOrigin(0.5);

    const retryButton = this.add.text(cameraCenterX, cameraCenterY, 'Retry', { fontSize: '32px', fill: '#fff' })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            this.gameOverDisplayed = false; // UI 표시 플래그 초기화

            gameOverText.destroy();
            retryButton.destroy();
            recordButton.destroy();

            score = 0;
            scoreText.setText('Score: 0'); // 점수 초기화

            gameOver = false;
            // this.scene.restart(); // 게임 다시 시작
            window.location.href = '/restart'
        });

    const recordButton = this.add.text(cameraCenterX, cameraCenterY + 100, 'Record & View Rankings', { fontSize: '32px', fill: '#fff' })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', async () => {
            let comment = prompt('Enter your comment:');
            if (comment === null || comment.trim() === '') {
                comment = "No comment";
            }

            try {
                await postScoreToAPI(playerNickname, score, comment); // 닉네임과 점수, 코멘트 전송
                window.location.href = '/rankings'; // 랭킹 페이지로 이동
            } catch (error) {
                console.error('Error saving score:', error);
            }
        });

    // Enter 키 이벤트 추가
    this.input.keyboard.on('keydown-ENTER', () => {
        retryButton.emit('pointerdown'); // Enter 키가 눌리면 Retry 버튼을 클릭한 것과 동일하게 처리
    });
}



// 점수 저장 API 호출 함수
function postScoreToAPI(user_nickname, user_score, comment) {
    const user_id = Date.now(); // user_id를 숫자형으로 설정 (예: 현재 시간을 밀리초로 사용)
    fetch('/scores', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-game-over': 'true',
        },
        body: JSON.stringify({
            user_id: user_id,
            user_nickname,
            user_score,
            comment
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Score saved:', data);
    })
    .catch((error) => {
        console.error('Error saving score:', error);
    });
}


const logBase10 = (x) => Math.log(x) / Math.log(10);

function calculateBombCount(score) {
    const baseBombCount = 0;  // 기본적으로 주어지는 총알 개수
    // const logBase = 100;  // 로그 함수의 밑(base)을 설정 (필요에 따라 조정 가능)
    const additionalBombs = Math.floor(64 * (logBase10(score / 10 +40) - logBase10(40)));
    // 점수에 따른 추가 폭탄 개수
    return additionalBombs;  // 기본 + 추가 폭탄 개수
}

function manageBombsBasedOnScore() {
    const bombsToGenerate = calculateBombCount(score); // 점수에 따른 총알 개수를 계산
    const currentBombCount = bombs.countActive(true);  // 현재 맵에 존재하는 총알의 수를 확인

    if (currentBombCount < bombsToGenerate) {
        // 총알이 부족하면 추가 생성
        const bombsNeeded = bombsToGenerate - currentBombCount;
        for (let i = 0; i < bombsNeeded; i++) {
            generateBombOutsideCamera.call(this);  // 필요한 만큼 추가 생성
        }
    } else if (currentBombCount > bombsToGenerate) {
        // 총알이 너무 많으면 제거
        const bombsToRemove = currentBombCount - bombsToGenerate;
        let removedBombs = 0;

        bombs.children.iterate((bomb) => {
            if (removedBombs < bombsToRemove) {
                bomb.destroy();  // 폭탄을 제거
                removedBombs++;
            }
        });
    }
}


function getDistanceFromCamera(camera, object) {
    if (!object || typeof object.x === 'undefined' || typeof object.y === 'undefined') {
        return Number.MAX_VALUE; // 최대 거리 반환 (즉, 너무 멀어서 제거할 수 있게)
    }

    const cameraCenterX = camera.midPoint.x;
    const cameraCenterY = camera.midPoint.y;
    const distance = Phaser.Math.Distance.Between(cameraCenterX, cameraCenterY, object.x, object.y);
    return distance;
}
