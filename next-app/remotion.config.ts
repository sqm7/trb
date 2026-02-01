
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

Config.overrideWebpackConfig((currentConfiguration) => {
    return {
        ...currentConfiguration,
        module: {
            ...currentConfiguration.module,
            rules: [
                ...(currentConfiguration.module?.rules ?? []).filter((rule) => {
                    if (!rule || rule === '...') return false;
                    // Remove existing css rule to avoid conflict
                    return rule.test?.toString() !== '/\\.css$/i';
                }),
                {
                    test: /\.css$/i,
                    use: [
                        'style-loader',
                        'css-loader',
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: [
                                        '@tailwindcss/postcss',
                                    ],
                                },
                            },
                        },
                    ],
                },
            ],
        },
    };
});
