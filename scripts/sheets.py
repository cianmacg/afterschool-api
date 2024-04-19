import pandas as pd
import sys
import json
from datetime import datetime as dt

#Add a new child to the database.
def add_new_kid(path, value):
    kids_df = pd.read_excel(path)
    
    id = pd.to_numeric(kids_df['ID'].iloc[-1]) + 1
    kids_df.loc[len(kids_df.index)] = [id, value, 'Out']
    kids_df.to_excel(path, index=False)
    #return json.dumps({"result" : kids_df.iloc[-1].to_json() })
    return kids_df.to_json()

#Delete a child from the database based on their ID
def delete_kid(path, kid):
    kids_df = pd.read_excel(path)
    kid = int(kid)
    
    if kid not in kids_df['ID'].values:
        return json.dumps({ 'result' : 'Unable to delete. ID does not exist.'})
    
    kids_df.drop(kids_df[kids_df['ID'] == kid].index, inplace=True)
    kids_df.to_excel(path, index=False)
    
    return kids_df.to_json()

#Changes the status of the ID "Kid" to the opposite of its current status.
def change_status(path, kid):
    kids_df = pd.read_excel(path, sheet_name="Kids")
    log_df = pd.read_excel(path, sheet_name="Log")
    
    # Kid ID
    kid = int(kid)
    # Kid Name
    name = kids_df[kids_df["ID"] == kid]['Name'][0]

    #Make sure the ID exists in our database, otherwise we have to tell the user it doesn't exist
    if kid not in kids_df['ID'].values:
        return json.dumps({ "result" : "This ID does not exist in the database."})
    
    # The new status will be put here
    status = ''
    kid_index = kids_df[kids_df["ID"] == kid].index
    
    #If the childs status = In, change it to Out
    if kids_df.at[kid_index[0], 'Status'] == 'In':
        kids_df.at[kid_index[0], 'Status'] = status = 'Out'

        
    #If the childs status = Out, change it to In
    elif kids_df.at[kid_index[0], 'Status'] == 'Out':
        kids_df.at[kid_index[0], 'Status'] = status = 'In'

    # Append the status change to the end of the Log
    new_row = pd.DataFrame({ 'ID': [kid],'Name' : [name], 'Status': [status], 'Timestamp': [dt.now().strftime('%Y-%m-%d %H:%M:%S')]})
    log_df = pd.concat([log_df, new_row], ignore_index=True)
    
    # Save changes back to the Excel file
    with pd.ExcelWriter(path, mode='a', engine='openpyxl', if_sheet_exists='replace') as writer:
        kids_df.to_excel(writer, sheet_name='Kids', index=False)
        log_df.to_excel(writer, sheet_name='Log', index=False)

    #return kids_df.to_json()
    return json.dumps({"result" : {
            'Name' : kids_df.at[kid_index[0], 'Name'],
            'New Status' : kids_df.at[kid_index[0], 'Status']
            }
        })

#Return a list of all children in the database and their statuses.
def get_kids(path):
    return pd.read_excel(path).to_json(orient = "records")

if __name__ == "__main__":
    try:
        to_do = sys.argv[1]
        path = sys.argv[2]
    except:
        print(json.dumps({"result" : "Not enough arguments. Minimum 2 required (Function and path to excel file)."}))
        sys.exit()
        
    if to_do == "add_kid":
        try:
            value = sys.argv[3]
        except:
            print(json.dumps({"result" : "This function requires a kid name. Please provide it after the path to the excel file."}))
            sys.exit()
            
        print(add_new_kid(path, value))
    
    elif to_do == "delete_kid":
        try:
            value = sys.argv[3]
        except:
            print(json.dumps({"result" : "This function requires a kid ID. Please provide it after the path to the excel file."}))
            sys.exit()
            
        print(delete_kid(path, value))
    
    elif to_do == "change_status":
        try:
            value = sys.argv[3]
        except:
            print(json.dumps({"result" : "This function requires a kid ID. Please provide it after the path to the excel file."}))
            sys.exit()
            
        print(change_status(path, value))
        
    elif to_do == "get_kids":
        print(get_kids(path))
        
    else:
        print(json.dumps({ "result" : "Unknown function name." }))