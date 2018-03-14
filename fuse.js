const { FuseBox, WebIndexPlugin, QuantumPlugin } = require('fuse-box');
const { src, context, task } = require('fuse-box/sparky');

//@ts-check
class FuseBoxContext {
    constructor() {
        this.production = false;
    }
    getConfig() {
        return FuseBox.init({
            target: 'browser@es2017',
            homeDir: 'src',
            output: 'dist/$name.js',
            useTypescriptCompiler: true,
            sourceMaps: true,
            hash: this.production,
            plugins: [
                WebIndexPlugin({
                    appendBundles: true,
                    template: './src/index.html'
                }),
                this.production &&
                    QuantumPlugin({
                        bakeApiIntoBundle: 'app',
                        uglify: true,
                        treeshake: true
                    })
            ]
        });
    }

    /**
     * @param {FuseBox} fuse
     */
    createBundle(fuse) {
        const app = fuse.bundle('app');
        if (!this.production) {
            app.hmr({ reload: true }).watch();
        }
        app.instructions('> index.ts');
    }
}

context(FuseBoxContext);

task(
    'default',
    ['clean'],
    /**
     * @param {FuseBoxContext} context
     */
    async (context) => {
        const fuse = context.getConfig();
        fuse.dev();
        context.createBundle(fuse);
        await fuse.run();
    }
);

task(
    'dist',
    ['clean'],
    /**
     * @param {FuseBoxContext} context
     */
    async (context) => {
        context.production = true;
        const fuse = context.getConfig();
        context.createBundle(fuse);
        await fuse.run();
    }
);

task('clean', async () => {
    await src('./dist')
        .clean('./dist')
        .exec();
});
