FROM cerner/terra-node-ci:1
# run the server
CMD ["npm", "run", "start-static"]
