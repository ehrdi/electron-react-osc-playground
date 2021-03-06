import React from 'react'
import OscManager from './OscManager/OscManager'

const usedKeys = [];
const generateKey = (min, max) => {
    let generatedKey = Math.floor(Math.random() * (max - min + 1)) +min;
    if(usedKeys.indexOf(generatedKey) === -1) {
        return generatedKey
    }
    generateKey(min, max);
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            managers: []
        }
        this.addManager = this.addManager.bind(this);
        this.closeManager = this.closeManager.bind(this);
    }

    addManager(e) {
        e.preventDefault();
        const managers = this.state.managers;
        
        let key = generateKey(1, 50);
        managers.push({
            manager: <OscManager closeManager={this.closeManager} key={key} id={key} />,
            id: key
        })

        this.setState({
            managers: managers
        })
    }

    closeManager(id) {
        let managers = this.state.managers;

        managers.map( (manager, index) => {
            if(manager.id === id) {
                if(managers.length > 1) {
                    managers.splice(index, 1);
                } else {
                    managers = [];
                }
            }
        })
        
        this.setState({
            managers: managers
        })
    }

    render() {
        const oscManagers = [];
        this.state.managers.map( (manager) => {
            oscManagers.push(manager.manager);
        })
        return (
            <React.Fragment>
                <h1>Hello World, this is a React Component!</h1>
                <button onClick={this.addManager}>Click to open a new OSC Manager Component</button>
                <br /><br /><hr /><br /> <br />
                {oscManagers}
            </React.Fragment>
        )
    }
}

export default App;
