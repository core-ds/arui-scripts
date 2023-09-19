import React from 'react';

import './styles.css';
import styles from './styles.module.css';

export const PostcssFeatures = () => (
    <details className='module-postcss-features'>
        <summary>postcss features check:</summary>
        <p className={styles.paragraph}>module.css paragraph</p>
        <p className='module-postcss-features__paragraph'>native css paragraph</p>
    </details>
);
