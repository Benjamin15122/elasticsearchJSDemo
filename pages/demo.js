import { Form, Card, Button, Input, Col, Row, Icon } from 'antd';
import React, { Component } from 'react';
import elasticsearch from 'elasticsearch';
import styles from './demo.less';

let initialState = {
    query:{
        bool:{
            filter:[
                {terms: {_id:["adf3613d-962f-4ee4-97cc-77175e9d9be7","16614172-5212-40fb-a4fd-eff0df22510f"]}},
                {range: {publish_time:{"gt" : "1544294940","lt" : "1544595414"}}}
            ]
        }
    },
    next: 1,
    content:""
}

const items = []
const children = [];

var client = new elasticsearch.Client({
    host: 'http://210.28.133.11:21535',
    log: 'trace'
});

let id=0;

async function testQuery(callback,queryProps){
    client.search({
        body: {
          query: queryProps
        }
      }).then(function (resp) {
          var hits = resp.hits;
          callback(hits);
      }, function (err) {
          console.trace(err.message);
    });
}

class demo extends Component{

    state = {
        ...initialState
    }

    handleSearch = () => {
        this.props.form.validateFields((err, values) => {
            if(!err){
                // console.log('Received values of form: ', values);
                const query = {
                    bool:{
                        filter:[
                            {terms: {_id:values.id}},
                            {range: {publish_time:values.publish_time}}
                        ]
                    }
                }
                console.log(query);
                testQuery((hits)=>this.setState({...this.state,content:hits}),query);
            }
        });
    }

    handleAdd = () => {
        console.log('add')
        const {
            form: { getFieldDecorator,getFieldValue }
          } = this.props;
        let {next} = this.state;
        items.push(
            <Col span={8} key={next}>
                <Form.Item label=' '>
                {getFieldDecorator(`id[${next}]`,{
                    validateTrigger: ['onChange', 'onBlur'],
                    rules:[{
                        required: false,
                        message: `set id${next}`
                    }]
                })(
                    <Input/>
                )}
                </Form.Item>
            </Col>
        );
        this.setState({
            ...this.state,
            next: next+1
        });
    }

    remove = (k) => {
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        // We need at least one passenger
        if (keys.length === 1) {
          return;
        }
        
        const filteredKeys = keys.filter(key => key !== k);
        const newKeys = filteredKeys.map((k,index)=>index);
        id--;
        // can use data-binding to set
        form.setFieldsValue({
          keys: newKeys
        });
      }
    
    add = () => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    const nextKeys = keys.concat(++id);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
        keys: nextKeys,
    });
    }

    handleReset = () => {
        this.setState({...initialState});
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        form.setFieldsValue({
            keys: [0]
        });
        id = 0;
    }

    render = ()=>{
        const {
            form: { getFieldDecorator,getFieldValue }
          } = this.props;
        const stylePannel = {
            height: '200px',
            margin: '10px 100px 0 100px',
            boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
            border: '1px solid #e8e8e8',
            overflow: 'scroll'
        };
        const styleTable = {
            height: '500px',
            margin: '10px 100px 20px 100px',
            boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
            border: '1px solid #e8e8e8',
            overflow: 'scroll'
        };
        const formItemLayout = {
            labelCol: {
              xs: { span: 24 },
              sm: { span: 4 },
            },
            wrapperCol: {
              xs: { span: 24 },
              sm: { span: 20 },
            },
          };
          const formItemLayoutWithOutLabel = {
            wrapperCol: {
              xs: { span: 24, offset: 0 },
              sm: { span: 20, offset: 4 },
            },
          };
          getFieldDecorator('keys', { initialValue: [0] });
          const keys = getFieldValue('keys');
        //   console.log(keys);
          const formItems = keys.map((k, index) => (
            <Col span={8} key={k}>
            <Form.Item
              label={index === 0 ? 'id' : ' '}
              required={false}
            >
              {getFieldDecorator(`id[${k}]`, {
                validateTrigger: ['onChange', 'onBlur'],
                rules: [{
                  required: false,
                  whitespace: true,
                  message: "Please input id or delete this field.",
                }],
              })(
                <Input placeholder={`id ${k}`} style={{width:"90%"}}/>
              )}
              {keys.length > 1 ? (
                <Icon
                  type="minus-circle-o"
                  disabled={keys.length === 1}
                  onClick={() => this.remove(k)}
                />
              ) : null}
            </Form.Item>
            </Col>
          ));
        return (
        <div>
            <h1 style={{marginLeft: '50px'}}>ES Demo:</h1>
            <div style={stylePannel}>
                <Form>
                    <Row style={{marginLeft:'20px'}} gutter={24}>
                    <Col span={8}>
                    <Form.Item label='publish_time.gt'>
                    {getFieldDecorator(`publish_time.gt`,{
                        rules:[{
                            required: true,
                            message: 'set latest time'
                        }]
                    })(
                        <Input/>
                    )}
                    </Form.Item>
                    </Col>
                    <Col span={8}>
                    <Form.Item label='publish_time.lt'>
                    {getFieldDecorator(`publish_time.lt`,{
                        rules: [{
                            required: true,
                            message: 'set earliest time'
                        }]
                    })(
                        <Input/>
                    )}
                    </Form.Item>
                    </Col>
                    <Col span={8} style={{textAlign:'center', marginTop:'40px'}}>
                        <Button onClick={this.add}>Add Id</Button>
                        <Button type='primary' onClick={this.handleSearch}>Search</Button>
                    </Col>
                    </Row>
                    <Row style={{marginLeft:'20px'}} gutter={24}>
                    {/* <Col span={8}>
                    <Form.Item label='id'>
                    {getFieldDecorator(`id[${0}]`,{
                        rules:[{
                            required: true,
                            message: 'set id_1'
                        }]
                    })(
                        <Input/>
                    )}
                    </Form.Item>
                    </Col> */}
                    {formItems}
                    </Row>
                </Form>
            </div>
            <h1 style={{marginLeft: '50px'}}>Result Here:</h1>
            <div style={styleTable}>
                {JSON.stringify(this.state.content)}
            </div>
        </div>);
    }
}


export default Form.create()(demo);