import {Greeting} from "../../../types";

const greetingQueryResolver = {
    Greeting(): Greeting {
        return { message: 'hello' }
    }
}

export default greetingQueryResolver;
