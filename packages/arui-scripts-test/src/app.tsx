import React from 'react';
import { Button } from '@alfalab/core-components/button';
import image from './clock.svg';
import { isSmaller } from './utils';

import styles from './app.module.css';
import './style.css';

export class App extends React.Component {
    state = {
        clickCount: 0
    };

    render() {
        return (
            <div className={ styles.root }>
                <h2>
                    Hello, arui-scripts!
                </h2>

                Check hot-loader: <br />
                Button is clicked { this.state.clickCount } times
                Clicked more than 10 times? <br />
                { isSmaller(this.state.clickCount, 10) }

                <Button>Button</Button>

                <button
                    className='btn'
                    onClick={ () => this.setState({ clickCount: this.state.clickCount + 1 }) }
                >
                    Up!
                    <img src={ image } className='icon' />
                </button>
            </div>
        )
    }
}
