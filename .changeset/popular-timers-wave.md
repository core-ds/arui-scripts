---
"arui-scripts": minor
---


## Текущая реализация нацелена на снятие лишней нагрузки в режиме разработки при проверки типов.

#### disableDevWebpackTypecheck=false, команда start:
    1. В конфиге для клиента запускается ForkTsCheckerWebpackPlugin.
    2. В конфигах, сделанных через createSingle - не запускается.
    
#### disableDevWebpackTypecheck=false, команда build:
    1. В конфиге для клиента запускается ForkTsCheckerWebpackPlugin.
    2. В конфигах, сделанных через createSingle - не запускается.

#### disableDevWebpackTypecheck=true, команда start:
    1. Запускается runCompilers c TSC_WATCH_COMMAND.
    2. В вебпаке для клиента и сервера ForkTsCheckerWebpackPlugin не запускается.

#### disableDevWebpackTypecheck=true, команда build:
    1. В конфиге для клиента запускается ForkTsCheckerWebpackPlugin.
    2. В конфигах, сделанных через createSingle - не запускается.