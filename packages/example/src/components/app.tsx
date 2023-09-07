import React from 'react';
import image from '../clock.svg';
import { isSmaller } from '../utils';

import styles from './app.module.css';
import './style.css';
import { Typography } from '@alfalab/core-components/typography';
import { Button } from '@alfalab/core-components/button';
import { Gap } from '@alfalab/core-components/gap';
import { ModulesTabs } from '#/components/modules-tabs';
import { PostcssFeatures } from './postcss-features';

export class App extends React.Component {
    state = {
        clickCount: 0
    };

    render() {
        return (
            <div className={ styles.root }>
                <Typography.Title tag='h1' className={styles.title}>
                    ARUI-scripts example app
                </Typography.Title>
                <Gap size='s' />

                <PostcssFeatures />

                <Typography.Text>
                    Check hot-loader: <br />
                    Button is clicked { this.state.clickCount } times
                    Clicked more than 10 times? <br />
                    { isSmaller(this.state.clickCount, 10) }
                </Typography.Text>
                <Gap size='s' />
                <Button
                    size='xs'
                    view='accent'
                    onClick={ () => this.setState({ clickCount: this.state.clickCount + 1 }) }
                >
                    Up!
                </Button>

                <Typography.Title tag='h2' defaultMargins={true}>
                    Примеры разных способов подключения модулей
                </Typography.Title>
                <ModulesTabs />
            </div>
        )
    }
}
