import React from 'react'
import { render } from 'react-dom'
import { ipcRenderer } from 'electron'
const createServer = require('electron').remote.require('./testmodule')

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newUdpPortValue: '',
            oscMessages: []
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.generateNewOscUdpServer = this.generateNewOscUdpServer.bind(this);
        this.sendMessageToMainProcess = this.sendMessageToMainProcess.bind(this);
        this.createNewServer = this.createNewServer.bind(this);
    }

    componentDidMount(){
        ipcRenderer.on('async-reply', (event, arg) => {
            console.log(arg);
        })
    }

    handleChange(event) {
        event.preventDefault();
        this.setState({ newUdpPortValue: event.target.value });
    }

    handleSubmit(event) {
        event.preventDefault();
        if(this.state.newUdpPortValue.length === 5){
            this.generateNewOscUdpServer(this.state.newUdpPortValue);
        }
    }

    generateNewOscUdpServer(port){
        const options = {
            port: port
        }
        ipcRenderer.send('generateNewOscServer', options);
        const oscAddress = 'osc' +port; 
        ipcRenderer.on(oscAddress, (event, arg) => {
            console.log(event, arg);

            const msgs = this.state.oscMessages;
            msgs.push(arg);
            this.setState({
                oscMessages: msgs
            })
        })
    }

    sendMessageToMainProcess() {
        ipcRenderer.send('async-message', 'ping');
    }

    createNewServer(port) {
        const newServer = createServer(port);
        newServer.on("message", function (oscMessage, timetag, info) {
            console.log("OSC Message - UDP("+newServer.options.localPort+"): ", oscMessage);
        });
        
        newServer.on("error", function (err) {
            console.log(err);
        });
    }

    render() {
        const oscMessages = [];
        this.state.oscMessages.forEach( (oscMsg) => {
            const msg = <div>{oscMsg.address}</div>
            oscMessages.push(msg);
        })
        return (
            <React.Fragment>
                <h1>Hello World, this is a React Component!</h1>
                <button onClick={this.sendMessageToMainProcess}>try communicating with main process</button>
                <br /><br /><hr /><br />
                <input type="text" value={this.state.newUdpPortValue} onChange={this.handleChange} />
                <br /><br />
                <button onClick={this.handleSubmit}>Click to generate a new OSC UDP Server on this Port</button>
                <br /><br />
                <h2>OSC Messages</h2>
                {oscMessages}
                <br /><br />
                <button onClick={() => this.createNewServer(this.state.newUdpPortValue)}>Click to start new server</button>
            </React.Fragment>
        )
    }
}

render(<App />, document.getElementById('root'))