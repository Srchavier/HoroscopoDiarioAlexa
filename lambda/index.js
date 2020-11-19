// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const Util = require('util.js');
const removeAccents = require('remover-acentos');
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');
const label = require('label-properties.js') 

const User = require('user.js')

let user;

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
   async handle(handlerInput) {
        
        const FULL_NAME_PERMISSION = 'alexa::profile::name:read'
        const EMAIL_PERMISSION = 'alexa::profile::email:read'
        
        const { serviceClientFactory } = handlerInput;
        
        try {
            
            const upsServiceCliente = serviceClientFactory.getUpsServiceClient();
            
            const profileName = await upsServiceCliente.getProfileName();
            const profileEmail = await upsServiceCliente.getProfileEmail();
            user = new User(profileName, profileEmail);
            
            const speakOutput = `${label.BOASVINDAS} ${profileName} ${label.BOASVINDASSERVICOS}`;
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
            
        } catch(error) {
            if (error.statusCode === 403) {
                const  speakOutput = label.PERMISSOES
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .withAskForPermissionsConsentCard([FULL_NAME_PERMISSION, EMAIL_PERMISSION])
                    .getResponse();
            } else {
                const  speakOutput = label.ERRORPERMISSOES
                 return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .getResponse();
            }
            
        }
    
    }
};

const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = label.BOASVINDASSKILL;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = label.SERVICOS;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = label.SERVICOS;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = label.FINALIZACAOSKILL;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `${label.INTENTNAOEXISTE} ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    async handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = label.ERRORSERVICOS;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/*-----------------------------------------------------------------------custom-----------------------------------------------------------------------------------*/

const BiscoitoIntentsHandle = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'BiscoitoIntents';
    },
    handle(handlerInput) {
       return Util.getFactory('biscoito').then( async (response) => {
            const resp = response.data
    
            let attributes = handlerInput.attributesManager.getSessionAttributes();
            attributes[removeAccents(user._email)] = resp;
            saveUser(handlerInput, attributes, 'persistent');
            
            return handlerInput.responseBuilder
                .speak(resp)
                .reprompt(label.REPROMPTBISCOITO)
                .withStandardCard(
                    "Biscoito da sorte", 
                    resp,
                    "https://img.elo7.com.br/product/main/16CAB21/biscoito-da-sorte-personalizado-decoracao.jpg", 
                    "https://img.elo7.com.br/product/main/16CAB21/biscoito-da-sorte-personalizado-decoracao.jpg")
                .getResponse();
                
        }).catch((error) => {
            console.log(error)
            return handlerInput.responseBuilder
                .speak(error)
                .reprompt(label.ERROR)
                .getResponse();
        });
    }
};


const SignoIntentsHandle = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SignoIntents';
    },
    async handle(handlerInput) {
        const isHoje = Alexa.getSlot(handlerInput.requestEnvelope, "hojeOuAmanha").resolutions.resolutionsPerAuthority[0].values[0].value.id;
        const signo = Alexa.getSlot(handlerInput.requestEnvelope, "nomeSigno").value;
        
        return Util.getFactory(`signo/${removeAccents(signo)}/${isHoje}`).then(async (response) => {
            const resp = response.data
        
            let attributes = handlerInput.attributesManager.getSessionAttributes();
            attributes[removeAccents(user._email)] = resp;
            saveUser(handlerInput, attributes, 'persistent');

            return handlerInput.responseBuilder
                .speak(resp)
                .reprompt(label.REPROMPTSIGNO)
                .withStandardCard(
                    "Signo", 
                    resp,
                    "https://www.miss.at/wp-content/uploads/2018/03/sternzeichen-schlangentr%C3%A4ger-1024x1024.jpg", 
                    "https://www.miss.at/wp-content/uploads/2018/03/sternzeichen-schlangentr%C3%A4ger-1024x1024.jpg")
                .getResponse();
        }).catch((error) => {
            console.log(error)
            return handlerInput.responseBuilder
                .speak(error)
                .reprompt(label.ERROR)
                .getResponse();
        });
    }
};

const MapaAstralIntentsHandle = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'MapaAstralIntents';
    },
    handle(handlerInput) {
        
        const sigla = Alexa.getSlot(handlerInput.requestEnvelope, "sigla").resolutions.resolutionsPerAuthority[0].values[0].value.name;
        const city = Alexa.getSlot(handlerInput.requestEnvelope, "city").value;
        const name = Alexa.getSlot(handlerInput.requestEnvelope, "name").value;
        const hour = Alexa.getSlot(handlerInput.requestEnvelope, "hour").value;
        const date = Alexa.getSlot(handlerInput.requestEnvelope, "date").value;

        return Util.postFactory(`mapa-astral`, {name, city: city - sigla, date, hour}).then(async (response) => {
            const resp = response.data
            return handlerInput.responseBuilder
                .speak(resp)
                .reprompt(label.REPROMPTBISCOITO)
                .withStandardCard(
                    "Mapa Astral", 
                    resp,
                    "https://mypixeland.com/wp-content/uploads/2019/05/mapa-astral-icone.png", 
                    "https://mypixeland.com/wp-content/uploads/2019/05/mapa-astral-icone.png")
                .getResponse();
        }).catch((error) => {
            console.log(error)
            return handlerInput.responseBuilder
                .speak(error)
                .reprompt(label.ERROR)
                .getResponse();
        });
    }
};

const BuscarUltimoComandoFalandoIntents = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'BuscarUltimoComandoFalandoIntents';
    },
    async handle(handlerInput) {
        
        const attributesManager = handlerInput.attributesManager;
        const att = await attributesManager.getPersistentAttributes();
        let response = label.ERRORREPITA;
        if(att[user._email]) {
        response = att[user._email];
        }
        
        return handlerInput.responseBuilder
            .speak(response)
            .reprompt(response)
            .getResponse();
    }
};


const SimpatiaSaudeIntentsHandle = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SimpatiaSaudeIntents';
    },
    async handle(handlerInput) {
        const tema = Alexa.getSlot(handlerInput.requestEnvelope, "simpatiaSaude").resolutions.resolutionsPerAuthority[0].values[0].value.id;
        const {intent} = handlerInput.requestEnvelope.request;
        console.log(intent)
        if(intent.slots.simpatiaSaude.confirmationStatus !== 'CONFIRMED') {
            return handlerInput.responseBuilder
                .speak("Simpatias para saúde como Evitar doenças, Manter a saúde, Largar o cigarro, Ter uma pele bonita, Perder gordura, Tirar dor nas costas, Ficar mais bonita, Deixar de roncar, Passar dor de ouvido, Sumir com verrugas e Para emagrecer.")
                .getResponse();
        }
        return Util.getFactory(`simpatia/simpatias-saude/${tema}`).then(async (response) => {
            const resp = response.data
            return handlerInput.responseBuilder
                .speak(resp + ', Muito Obrigado e volte sempre ao seu horóscopo diário.')
                .getResponse();
            }).catch((error) => {
                console.log(error)
                return handlerInput.responseBuilder
                    .speak(error)
                    .reprompt(label.ERROR)
                    .getResponse();
            });
         
    }
};

const SimpatiaTrabalhoIntentsHandle = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SimpatiaTrabalhoIntents';
    },
    async handle(handlerInput) {
        const tema = Alexa.getSlot(handlerInput.requestEnvelope, "simpatiaTrabalho").resolutions.resolutionsPerAuthority[0].values[0].value.id;
    
        const {intent} = handlerInput.requestEnvelope.request;
        if(intent.slots.simpatiaTrabalho.confirmationStatus  !== 'CONFIRMED') {
            return handlerInput.responseBuilder
                .speak("Simpatias para seu trabalho como Evitar mau olhado no trabalho, Manter o emprego, Obter emprego, Arrumar trabalho, Aprovação em concursos e Conseguir emprego.")
                .getResponse();
        }
        return Util.getFactory(`simpatia/simpatias-trabalho/${tema}`).then(async (response) => {
            const resp = response.data
            return handlerInput.responseBuilder
                .speak(resp + ', Muito Obrigado e volte sempre ao seu horóscopo diário.')
                .getResponse();
            }).catch((error) => {
                console.log(error)
                return handlerInput.responseBuilder
                    .speak(error)
                    .reprompt(label.ERROR)
                    .getResponse();
            });
     
    }
};

const SimpatiaNegocioIntentsHandle = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SimpatiaNegocioIntents';
    },
    async handle(handlerInput) {
        const tema = Alexa.getSlot(handlerInput.requestEnvelope, "simpatiaNegocio").resolutions.resolutionsPerAuthority[0].values[0].value.id;

        const {intent} = handlerInput.requestEnvelope.request;
        if(intent.slots.simpatiaNegocio.confirmationStatus  !== 'CONFIRMED') {
            return handlerInput.responseBuilder
                .speak("Simpatias para seu negócio temos, Ter sucesso profissional, Arrumar emprego, Crescimento profissional, Prosperar nos negócios, Atrair dinheiro e Apareçam os bons negócios.")
                .getResponse();
        }
        
        return Util.getFactory(`simpatia/simpatias-negocios/${tema}`).then(async (response) => {
            const resp = response.data
            return handlerInput.responseBuilder
                .speak(resp + ', Muito Obrigado e volte sempre ao seu horóscopo diário.')
                .getResponse();
            }).catch((error) => {
                console.log(error)
                return handlerInput.responseBuilder
                    .speak(error)
                    .reprompt(label.ERROR)
                    .getResponse();
            });
     
    }
};

const SimpatiaCasamentoIntentsHandle = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SimpatiaCasamentoIntents';
    },
    async handle(handlerInput) {
        const tema = Alexa.getSlot(handlerInput.requestEnvelope, "simpatiaCasamento").resolutions.resolutionsPerAuthority[0].values[0].value.id;
        const {intent} = handlerInput.requestEnvelope.request;
        if(intent.slots.simpatiaCasamento.confirmationStatus  !== 'CONFIRMED') {
            return handlerInput.responseBuilder
                .speak("Simpatias para seu casamento temos Acabar as brigas entre o casal, Aumentar a paixão, Parar de brigar, Muita felicidade no casamento e Afastar alguém de seu marido ou de sua mulher.")
                .getResponse();
        }
        return Util.getFactory(`simpatia/simpatias-casamento/${tema}`).then(async (response) => {
            const resp = response.data
            return handlerInput.responseBuilder
                .speak(resp + ', Muito Obrigado e volte sempre ao seu horóscopo diário.')
                .getResponse();
            }).catch((error) => {
                console.log(error)
                return handlerInput.responseBuilder
                    .speak(error)
                    .reprompt(label.ERROR)
                    .getResponse();
            });
     
    }
};

const SimpatiaAmorIntentsHandle = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SimpatiaAmorIntents';
    },
    async handle(handlerInput) {
        const tema = Alexa.getSlot(handlerInput.requestEnvelope, "temaAmor").resolutions.resolutionsPerAuthority[0].values[0].value.id;
        const {intent} = handlerInput.requestEnvelope.request;
        if(intent.slots.temaAmor.confirmationStatus  !== 'CONFIRMED') {
            return handlerInput.responseBuilder
                .speak("Temos algumas simpatias de amor para você como conquistar um novo amor, amor infinito, ter a pessoa amada, fidelidade sempre e conquistar alguém, amarração da pessoa amada.")
                .getResponse();
        }
        return Util.getFactory(`simpatia/simpatias-amor/${tema}`).then(async (response) => {
            const resp = response.data
            return handlerInput.responseBuilder
                .speak(resp + ', Muito Obrigado e volte sempre ao seu horóscopo diário.')
                .getResponse();
            }).catch((error) => {
                console.log(error)
                return handlerInput.responseBuilder
                    .speak(error)
                    .reprompt(label.ERROR)
                    .getResponse();
            }
        );
     
    }
};

async function saveUser(handlerInput, attributes, mode) {
    if(mode === 'session'){
        await handlerInput.attributesManager.setSessionAttributes(attributes);
    } else if(mode === 'persistent') {
        console.info("Saving to Dynamo: ",attributes);
        return new Promise((resolve, reject) => {
            handlerInput.attributesManager.getPersistentAttributes()
                .then(async (persistent) => {
                    delete attributes['isInitialized'];
                    await handlerInput.attributesManager.setPersistentAttributes(attributes);

                    await resolve(handlerInput.attributesManager.savePersistentAttributes());
                })
                .catch((error) => {
                        reject(error);
                });
        });
    }
}
   
const GetUserDataInterceptor = {
    process(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();
        if (handlerInput.requestEnvelope.request.type === 'LaunchRequest' && !attributes['isInitialized']) {
            return new Promise((resolve, reject) => {
                handlerInput.attributesManager.getPersistentAttributes()
                    .then((attributes) => {
                        attributes['isInitialized'] = true;
                        saveUser(handlerInput, attributes, 'session');
                        resolve();
                    })
                    .catch((error) => {
                        reject(error);
                    })
            });
        }
    }
};

   
// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        
        BiscoitoIntentsHandle,
        SignoIntentsHandle,
        MapaAstralIntentsHandle,
        BuscarUltimoComandoFalandoIntents,
        SimpatiaAmorIntentsHandle,
        SimpatiaCasamentoIntentsHandle,
        SimpatiaNegocioIntentsHandle,
        SimpatiaTrabalhoIntentsHandle,
        SimpatiaSaudeIntentsHandle,
        
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    //.addRequestInterceptors(GetUserDataInterceptor)
    .addErrorHandlers(
        ErrorHandler,
    )
    .withPersistenceAdapter(
        new persistenceAdapter.S3PersistenceAdapter({ bucketName : process.env.S3_PERSISTENCE_BUCKET})
    ).withApiClient(new Alexa.DefaultApiClient())
    .lambda();
