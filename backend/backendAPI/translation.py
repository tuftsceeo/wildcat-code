'''testing new protocol for front-to-back end ranslation handling'''
'''may decide to transition translation handling over to web-side,
    --- recieving JSON file, parsing to .py, sending to Spike ---
'''
from typing import List, Dict

devices = []
PROGRAM_EXECUTABLE = ""
imports : list[str] = []
component_services : list[str] = []

'''CURRENT hub module index as follows'''
HUB_IMPORT_MAPPING = {
    "light_matrix" : "light_matrix",
    "device" : "port"
}

'''usable method for below index is redundant'''
'''support for indexing is now provided by check_imports()'''
'''COMPONENT_IMPORT_MAPPING = {
    "motor" : "motor",
    "color_sensor" : "color_sensor\nimport color",
    "distance_sensor" : "distance_sensor",
    "force_sensor" : "force_sensor"
}'''

'''CURRENT compatible component device index as follows'''
COMPONENTS : list[str] = ["motor", "color_sensor", "distance_sensor", "force_sensor"]
testSplit = "motor1-go4"
print(testSplit.split('-'))

def check_imports(value):
    if value in COMPONENTS:
        imports.append(f"import {value}")
        if value == COMPONENTS[1]:
            imports.append("import color")
    
check_imports("color_sensor")
print("""{}""".format("\n".join(imports)))

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

def getTrack(track : dict[str], devices : list[str]) -> list[str]:
    for value in track:
        '''for blah in blah_blah_blah:
        --- if (first key) -->
        ----- for item in list:
        ------- iteration = 0
        ------- check for repeat component --> if value in 
        ------- new device_Component(item, #, port) <-- assign port from DEVICE_NOTIFICATION
        ------- append to "devices" list
        --- nested loop (sorting) each key & corresponding values for EACH STEP
                    ^^see note above about lists within dictionaries^^
        '''

class device_Component():
    
    def __init__(self, component : str, iteration : int, port : int|str, service : str):
        self.__name__ = f"{component}{iteration}"
        self.component = component #module type; motor/ type of sensor
        self.port = port #Spike port of component
        self.service = service #what the component is doing
        
   # def addImport() -> str:
        

program_blocks: dict[str] = {"motor" : ""}


''' *method for appending into multi-line str* --> using triple-quote's method '''
parts = ["Hello", "World", "From", "Python"]
PROGRAM_EXECUTABLE = """{}""".format("\n".join(parts))
#print(PROGRAM_EXECUTABLE)

async def to_py_code(steps : dict[str], device_Component) -> list[str]:
    imports : list[str] = ["words", "things"]
    component_services : list[str] = []
    '''for (step in steps):
        return addImport()'''