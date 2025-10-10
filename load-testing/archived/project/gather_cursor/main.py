import requests
import pandas as pd

url = 'http://foundation.loadtest.local/query'
params = { 'Content-Type': 'application/json' }
query = """query ($first: Int, $after: String){ 
    items(first: $first, after: $after) {
        edges {
            cursor
        }
    }
}"""

def get_cursor(cursor) :
    variables = {'first': 100, 'after': cursor}
    r = (requests.post(url,json={"query":query, "variables":variables},params=params))
    return r.json()["data"]['items']["edges"]

def to_csv(data) :
    df = pd.DataFrame(data)
    df.to_csv("./cursors.csv", index=False)

def main() :
    cursors=[]
    init_cursor = "NDI2NjczMzUtYmNmMS00NDdiLThhYTYtNDgzZDAyNjAxY2Ey"
    check = True
    while check :
        r = get_cursor(init_cursor)
        for i in r:
            cursor = i.get('cursor')
            cursors.append(cursor)
        init_cursor=cursor
        print(init_cursor)
        if len(r)<10 :
            check= False
    to_csv(cursors)
    
if __name__ == '__main__':
    main()