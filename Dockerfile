FROM docker.cernerrepos.net/ion/ion-node:3

# run the server
CMD ["npm", "run", "start-static"]
