import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import Main from './views/Main.vue'
import Table from './views/nav1/Table.vue'
import Form from './views/nav1/Form.vue'
import TypeDefine from './views/nav2/TypeDefine.vue'
import KindDefine from './views/nav2/KindDefine.vue'

let routes = [
    /*{
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    //{ path: '/main', component: Main },
    {*/
    {
        path: '/',
        component: Home,
        name: '标签管理',
        iconCls: 'el-icon-menu',//图标样式class
        children: [
            { path: '/table', component: Table, name: '类型定义' },
            { path: '/form', component: Form, name: '标签库' },
        ]
    },
    {
        path: '/',
        component: Home,
        name: '品类管理',
        iconCls: 'el-icon-menu',//图标样式class
        children: [
            { path: '/typeDefine', component: TypeDefine, name: '类别定义'},
            { path: '/kindDefine', component: KindDefine, name: '品类定义' },
        ]
    },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];

export default routes;