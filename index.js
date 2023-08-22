require('dotenv').config();
const fs = require('fs');
const path = require('path');
const $http = require('./http.js');

async function getTeam() {
    const { data } = await $http.get("/team");
    return data?.teams.pop();
}

async function getUser() {
    const { data } = await $http.get(`/user`);
    return data?.user;
}

async function getShared( teamId ) {
    const { data } = await $http.get(`/team/${teamId}/shared`);
    return data;
}

async function getTasks( listId, userID ) {
    const date = new Date();
    const updated_gt = new Date(date.getTime() - (7 * 86400000));

    const { data } = await $http.get(`/list/${listId}/task?assignees[]=${userID}&include_closed=true&order_by=updated&date_updated_gt=${updated_gt.getTime()}`);
    return data;
}

async function getSetup() {
    if( fs.existsSync('./tmp/setup.json') ) {
        return JSON.parse(fs.readFileSync('./tmp/setup.json'));
    }

    if(!fs.existsSync('./tmp')) {
        await fs.mkdir('./tmp', { recursive: true }, (err) => {
            err && console.error(err)
        });
    }

    const user = await getUser();
    const team = await getTeam();
    const shared = await getShared(team.id);
    const listIds = [];
    (shared.shared?.folders[0].lists || []).forEach( list => {
        listIds.push(list.id);
    });

    const obj = {
        user,
        team,
        listIds,
        shared
    }

    fs.writeFileSync('./tmp/setup.json', JSON.stringify(obj, null, 2), 'utf-8');

    return obj;

}

function getPrevWorkDay (t) {
    if(!t) t = new Date();
    if( !(t instanceof Date) ) t = new Date(t);
    var prevDay = new Date( t.getTime());
    do {
      prevDay = new Date( prevDay.getTime() - 86400000 );
    } while( -1 !== [0, 6].indexOf(prevDay.getDay()) );
    return prevDay;
  }

function getDayByNumber( number ) {
    const arr = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    return arr[number];
}

(async () => {
    const { listIds, user } = await getSetup();
    const listsIdProms = [];

    const today = new Date();
    today.setHours(0); 
    today.setMinutes(0);
    today.setSeconds(0);

    const tomorrow = getPrevWorkDay();

    (listIds || []).forEach( listId => {
        listsIdProms.push(getTasks(listId, user.id));
    });

    let resp = await Promise.all(listsIdProms);

    resp = resp.map(a => a.tasks);

    const arr = [].concat.apply([], resp);

    fs.writeFileSync('./tmp/tasks.json', JSON.stringify(resp, null, 2), 'utf-8');

    const tomorrowTasks = arr.filter(task => {
        return ( task.date_updated >= tomorrow.getTime() || (task.date_done && task.date_done >= tomorrow.getTime()) || ['in progress'].includes(task?.status?.status));
    });

    const todayTasks = arr.filter(task => {
        return ['in progress', 'to do'].includes(task?.status?.status);
    });

    const tmpl = [];

    tmpl.push(`😎 Trabalhei em:`);

    if(!tomorrowTasks.length){
        tmpl.push("👀 Nenhuma tarefa anterior...");
    } else {
        tomorrowTasks.forEach(task => {
            tmpl.push(`${task.custom_id} => ${task.name}`);
        });
    }

    const taskCodeReview = arr.filter(task => {
        return ['code review'].includes(task?.status?.status);
    });

    if( taskCodeReview.length ) {
        tmpl.push("\n👍 Minhas tarefas aguardando Code Review:")
        taskCodeReview.forEach(task => {
            tmpl.push(`${task.custom_id} => ${task.name}`);
        });
    }

    const taskStaging = arr.filter(task => {
        return ['homologation'].includes(task?.status?.status);
    });

    if( taskStaging.length ) {
        tmpl.push("\n🤞 Tarefas que estão aguardando homologação:")
        taskStaging.forEach(task => {
            tmpl.push(`${task.custom_id} => ${task.name}`);
        });
    }

    const tasksPaused = arr.filter(task => {
        return ['paused'].includes(task?.status?.status);
    });

    if( tasksPaused.length ) {
        tmpl.push("\n🫠 Estas aqui estão pausadas:")
        tasksPaused.forEach(task => {
            tmpl.push(`${task.custom_id} => ${task.name}`);
        });
    }


    if(!todayTasks.length) {
        tmpl.push("\n🥺 Para hoje: nenhuma tarefa por enquanto. ")
    } else {
        tmpl.push("\n🫡 Para hoje, tenho:")
        todayTasks.forEach(task => {
            tmpl.push(`${task.custom_id} => ${task.name}`);
        });
    }

    console.log(`## SUA DAILY: ${new Date().toLocaleDateString('pt-BR')} ##\n\n${tmpl.join('\n')}\n\n`);
    console.log("Arquivo txt: %s", path.resolve(__dirname, "/tmp/tasks.txt"));
    
    fs.writeFileSync('./tmp/tasks.txt', tmpl.join('\n'), 'utf-8');
})();
