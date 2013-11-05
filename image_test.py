from PIL import Image
# from pylab import *
# from numpy import *
# 
kayaking = Image.open('kayaking.jpg')# .convert('L')
# 
# kayaking2 = 255 - kayaking
# 
# k3 = (100.0/255) * kayaking + 100
# 
# k4 = 255.0 * (kayaking/255.0)**2
# print int(k3.min()), int(k3.max())


# read image to array
# kayaking = array(Image.open('kayaking.jpg'))
# 
# # plot the image
# imshow(kayaking)
# 
# #some points
# x = [100,100,400,400]
# y = [200,500,200,500]
# 
# #plot the points with red star-markers
# plot(x,y,'r*')
# 
# # line plot connecting the first two points
# plot(x[:2], y[:2])
# 
# #add title and show the plot
# title('Plotting: "kayaking.jpg"')
# show()
 
futbol = Image.open("IMG_2867.JPG")
# box = (100,100,400,400)
region = futbol.crop((100,100,400,400))
region = region.resize((200,200))
region = region.rotate(45)
kayaking.paste(futbol.crop((100,100,400,400)).resize((200,200)).rotate(45), (0,0,200,200))
kayaking.show()