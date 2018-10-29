import React from 'react'
import { render } from 'react-dom'
import osc from 'osc-browser'
import { ipcRenderer } from 'electron'

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            wsPort: '',
            newUdpPortValue: ''
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.connectWebsockets = this.connectWebsockets.bind(this);
        this.generateNewOscUdpServer = this.generateNewOscUdpServer.bind(this);
        this.sendMessageToMainProcess = this.sendMessageToMainProcess.bind(this);
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

    connectWebsockets(){
        var wsPort = new osc.WebSocketPort({
            url: "ws://localhost:8081", // URL to WebSocket Server.
            metadata: false
        });
        wsPort.open();
        wsPort.on("ready", () => {
            console.log("Listening for OSC over WebSockets.");
        });
        wsPort.on("message", (oscMsg, timestamp, info) => {
            console.log('received osc message: ', oscMsg);
        })
        this.setState({ wsPort: wsPort });
    }

    generateNewOscUdpServer(port){
        const options = {
            port: port
        }
        ipcRenderer.send('generateNewOscServer', options);
        const oscAddress = 'osc' +port; 
        ipcRenderer.on(oscAddress, (event, arg) => {
            console.log(event, arg);
        })
        /*
        this.state.wsPort.send({
            address: "/generateNewOscServer",
            args: [
                {
                    type: "i",
                    value: port
                }
            ]   
        })
        */
    }

    sendMessageToMainProcess() {
        ipcRenderer.send('async-message', 'ping');
    }

    render() {
        return (
            <div>
                <h1>Hello World, this is a React Component!</h1>
                <button onClick={this.sendMessageToMainProcess}>try communicating with main process</button>
                <button onClick={this.connectWebsockets}>Click to connect to OSC UDP Server via WebSockets</button>
                <br /><br /><hr /><br />
                <input type="text" value={this.state.newUdpPortValue} onChange={this.handleChange} />
                <br /><br />
                <button onClick={this.handleSubmit}>Click to generate a new OSC UDP Server on this Port</button>
            </div>
        )
    }
}

render(<App />, document.getElementById('root'))