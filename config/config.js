export default {
    plugins: [
        ['umi-plugin-react', {
          antd: true
        }],
    ],
    routes: [{
        path: '/',
        redirect: '/demo'
    },{
        path: '/demo',
        component: './demo'
    }]
}