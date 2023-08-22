Gera daily baseada em suas taréfas do ClickUp. Não incluí taréfas de outros times assinadas à você.

### Configuração:

```
.env
# get your clickup's personal token: 
# https://clickup.com/api/developer-portal/authentication#personal-token
CLICKUP_TOKEN=YOUR_PERSONAL_TOKEN
CLICKUP_API=https://api.clickup.com/api/v2
```


### para rodar:
```
$ yarn install //instala dependências
$ yarn clean // remove pasta ./tmp/
$ yarn start

## SUA DAILY: 22/08/2023 ##

😎 Segunda:
CAFE_TEAM-4213 => [HOTFIX] Informação estática de Café
CAFE_TEAM-4191 => CMS - H1 da página de café

👍 Minhas tarefas aguardando Code Review:
CAFE_TEAM-4191 => CMS - H1 da página de café

🫠 Estas aqui estão pausadas:
CAFE_TEAM-4121 => Descentralização da montagem de SEO das páginas de café

🥺 Para hoje: nenhuma tarefa por enquanto.

Arquivo txt: /tmp/tasks.txt


```
