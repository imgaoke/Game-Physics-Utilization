requirejs.config({
    "baseUrl": "js",
    paths: {
        //"Phaser": "https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min"
        "Phaser": "https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser"
    }
});

requirejs(["main"], () => { });
