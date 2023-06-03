import requests
import json

pictures_url = '...'

def fetch_json_data(url):
    try:
        response = requests.get(url)

        if response.status_code == 200:
            return response.json()
        else:
            print(f"HTTP request failed with status code: {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"An error occurred during the request: {e}")
        return None

def downloadPictures(json_data):
    print(json_data)
    items = json_data["items"]
    for item in items:
        downloadPicture(item["name"])

def downloadPicture(picturename):
    picture_url = pictures_url + picturename
    picture_json = fetch_json_data(picture_url)
    if (picture_json):
        downloadTokens = picture_json["downloadTokens"]
        pictureBytesUrl = picture_url + "?alt=media&token=" + downloadTokens

        picture_response = requests.get(pictureBytesUrl)

        if picture_response.status_code == 200:
            image_data = picture_response.content

            with open(picturename, 'wb') as image_file:
                image_file.write(image_data)

    else:
        print("failed for picture: " + picturename)


def main():
    json_data = fetch_json_data(pictures_url)

    if json_data:
        print("ok data")
        downloadPictures(json_data)
    else:
        print("Failed to fetch JSON data.")

if __name__ == "__main__":
    main()
