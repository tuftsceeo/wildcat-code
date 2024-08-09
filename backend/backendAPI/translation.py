'''protocol for front-to-back end translation handling'''

#from typing import List, Dict
from collections.abc import Iterable

# passable parameters for library: programDict : Dict, ports : list
# NEXT STEPS: Create a class for 'translation' that takes the above parameters
# which then 

'''
* getDevices() -- pulls first value (device list) of recieved program message  
* input(s): 'track' - Iterable of a dictionary of strings
* output(s): 'list[]' - first value of Iterable; component devices in current program
'''
def getDevices(track : Iterable[dict[str]]) -> list[str]:
    return(placeHolder[next(track)])

'''
* getTrack() -- pulls step-by-step service values of recieved program message   
* input(s): 'track' - Iterable of a dictionary of strings
* output(s): 'list[list[]]' - remaining values of Iterable; component services by step
'''
def getTrack(track : Iterable[dict[str]]) -> list[str]:
    step_list =[]
    for currStep in track:
       #### NEXT STEPS:
            # nest a loop in here to examine each step's list of services
            # call to_py_code()?????
            # append services to step_list!!
       # print(currStep)
       #step_list.append(placeHolder[currStep])
    # return step_list
        return

def to_py_code(steps : dict[str], device_Component) -> list[str]:
    print("something")

'''below line to be replaced with recieved mesage from server'''
placeHolder = {"component_list" : ["motor","color_sensor","light_matrix"], "step1" : ["thing", "thing2"], "step2" : "value3"}
programMessage : Iterable[dict[str]] = iter(placeHolder)
devices = getDevices(programMessage) #device list for component mapping
track = getTrack(programMessage) #list of services per step
PROGRAM_EXECUTABLE = ""

#he following lists will be assigned as appropriate
hubImports : list[str] = [] #imports from hub will be merged into 'imports' (below list)
imports : list[str] = [""] 
component_services : list[str] = []

'''CURRENT compatible hub/component device index as follows'''
HUB_MODULES : list[str] = ["light_matrix", "port"]
COMPONENTS : list[str] = ["motor", "color_sensor", "distance_sensor", "force_sensor"]

def check_imports(value):
    if value in HUB_MODULES:
        hubImports.append(value)
    if value in COMPONENTS:
        if "port" not in hubImports:
            hubImports.append("port")
        imports.append(f"import {value}")
        if value == COMPONENTS[1]:
            imports.append("import color")

def setImports():
    for item in devices:
        check_imports(item)
    imports[0] = ("from hub import {}".format(", ".join(hubImports)))

setImports()
PROGRAM_EXECUTABLE = "\n".join(imports)
print(PROGRAM_EXECUTABLE)
#for item in COMPONENT_IMPORT_MAPPING:
#    print(COMPONENT_IMPORT_MAPPING[item])


''' ** implementation of getTrack() function for recieving message from WEB UI ** '''
'''    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
############## MAKE EACH STEP OF THE ACTIVITY INTO A {STEP : MOD+SERV[]} ITEM ###############
--- Example packet from WEB UI; form of dict w/ component-\-port-\ as key, service as value ---
--- {"component_list" : "light_matrix-motor-motor-color_sensor",
    "motor1-motor2" : 
    }
--- Example 2:
    --- the track (formatted) -- dictionary of steps
        --- {component_list : ["motor-2, color_sensor-1", ...], step1 : [...], ... : [...]}
        --- item[0] --> activity component index {component_list:[components]} ---
        --- item[1+] --> activity step {step#:[component-service,motor1-go2,motor2-go4], step#: [color_sensor-red]} ---
'''


    
'''below is a general format for the overall translation script... kind of'''
class device_Component():
    
    def __init__(self, component : str, iteration : int, port : int|str, service : str):
        self.__name__ = f"{component}{iteration}"
        self.component = component #module type; motor/ type of sensor
        self.port = port #Spike port of component
        self.service = service #what the component is doing
        
   # def addImport() -> str:
        

SERVICE_MAPPING = {
        ""
    }

program_blocks: dict[str] = {"motor" : ""}


''' *method for appending into multi-line str* --> using .join() '''
parts = ["Hello", "World", "From", "Python"]
PROGRAM_EXECUTABLE = "\n".join(parts)
#print(PROGRAM_EXECUTABLE)




'''usable method for below index is redundant'''
'''support for indexing is now provided by check_imports()'''
'''COMPONENT_IMPORT_MAPPING = {
    "motor" : "motor",
    "color_sensor" : "color_sensor\nimport color",
    "distance_sensor" : "distance_sensor",
    "force_sensor" : "force_sensor"
}

HUB_IMPORT_MAPPING = {
    "light_matrix" : "light_matrix",
    "device" : "port"
}
'''

'''for blah in blah_blah_blah:
            --- if (first key) -->
            ----- for item in list:
            ------- iteration = 0
            ------- check for repeat component --> if value in 
            ------- new device_Component(item, int(), port) <-- assign port from DEVICE_NOTIFICATION
            ------- append to "devices" list
            --- nested loop (sorting) each key & corresponding values for EACH STEP
                        ^^see note above about lists within dictionaries^^
'''
