import React from 'react'
const createStream = require('electron').remote.require('./createStream')
const getIPAddresses = require('electron').remote.require('./getIpAddresses')

class OscManager extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            startOnPort: '',
            activeStream: '',
            oscMessages: []
        }
        this.handleStartPortChanges = this.handleStartPortChanges.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.createNewOscStreamOnPort = this.createNewOscStreamOnPort.bind(this);
        this.initStream = this.initStream.bind(this);
        this.printMessage = this.printMessage.bind(this);
        this.printBundle = this.printBundle.bind(this);
    }

    handleStartPortChanges(e) {
        e.preventDefault();
        this.setState({
            startOnPort: e.target.value
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        //TODO
        //check if event matches certain criteria
        //and forward it to the right function
        //...
        this.createNewOscStreamOnPort(this.state.startOnPort);
    }

    createNewOscStreamOnPort(port) {
        //TODO
        //check if port is used by other Manager Components
        //and check if this port is already listening to another port
        //...
        const oscStream = createStream(port);
        this.setState({
            activeStream: oscStream
        })
        this.initStream(oscStream);        
        oscStream.open();
    }


    initStream(stream){
        //TODO
        //...

        const that = this;

        stream.on("ready", () => {
            const ipAddresses = getIPAddresses();
            ipAddresses.forEach( (address) => {
                console.log(" Host:" + address + ", Port:" + stream.options.localPort);
            });
        })

        stream.on("message", (oscMessage, timetag, info) => {
            console.log("OSC Message (UDP Port "+stream.options.localPort+"): " + oscMessage);
            that.printMessage(oscMessage, timetag, info);
        })

        stream.on("bundle", (oscBundle, timetag, info) => {
            console.log("OSC Bundle (UDP Port "+stream.options.localPort+"): " + oscBundle);
            that.printBundle(oscBundle, timetag, info);
        })

        stream.on("error", (err) => {
            console.log("Error on UDP Port "+stream.options.localPort+": " + err);
        })
        
    }

    printMessage(message, timetag, info) {
        //TODO
        //...
        const oscMessages = this.state.oscMessages;
        oscMessages.push(message);
        this.setState({
            oscMessages: oscMessages
        })
    }

    printBundle(bundle, timetag, info) {
        //TODO
        //...
    }

    render() {
        const oscMessages = [];
        this.state.oscMessages.forEach( (oscMessage, index) => {
            const message = <div key={index}>{oscMessage.address}</div>
            oscMessages.push(message);
        })

        return(
          <div>
              <input type="text" value={this.state.startOnPort} onChange={this.handleStartPortChanges} />
              <br /><br />
              <button onClick={this.handleSubmit}>Click to generate a new OSC UDP Server on this Port</button>
              <br /><br />
              <h2>OSC Messages</h2>
              {oscMessages}
              <hr />
          </div>  
        );
    }
}

export default OscManager;