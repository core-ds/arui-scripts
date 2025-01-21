import React from 'react';

import './styles.css';
import styles from './styles.module.css';

export const PostcssFeatures = () => (
    <details className='postcss-features'>
        <summary>postcss features check:</summary>
        <p className={styles.paragraph}>module.css paragraph</p>
        <p className='postcss-features__paragraph'>native css paragraph</p>
        <p className={styles.mediaTest}>red text for not desktop rule</p>
        <p className={styles.mediaTest2}>red text for desktop or mobile rule</p>
        <p className={styles.mediaTest3}>red text for desktop-m rule</p>
    </details>
);
