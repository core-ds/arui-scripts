---
'arui-scripts': minor
---

#### Добавлена возможность перезаписывать некоторые параметры для базового конфига nginx (/etc/nginx/nginx.conf).

Пример добавления нового свойства `nginx` (в примере указаны значения, которые и так будут использованы по-умолчанию)

```json
"aruiScripts": {
    "nginx": {
        "workerProcesses": 2,
        "workerRlimitNoFile": 20000,
        "workerConnections": 19000,
        "eventsUse": "epoll",
        "daemon": "off"
    }
}
```


