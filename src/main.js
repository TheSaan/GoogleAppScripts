/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/*
This Script provides some methods to e.g. add companies data to all group included contacts
This works 
Author: Michael Knöfler, 13. Nov 2016
*/

/*
Returns the contacts list of the group
*/
function getContactList(workGroup){   
 
  var group = ContactsApp.getContactGroup(workGroup);
  
  var contacts = group.getContacts();
  
  return contacts;
}

/*
Returns all groups which have a contact which represents the company
to get the data from
(in the contact notes has to be an "source" text)
*/
function addCompanyDataToContacts(){
  var groups = ContactsApp.getContactGroups();
  
  for(var i = 0; i < groups.length; i++){
   //search for source contact
    var group = groups[i];
    var grName = group.getName();
    var contacts = group.getContacts();
    var isSource = false;
    var groupName = "no value";
    for(var k = 0; k < contacts.length; k++){
      var notes = contacts[k].getNotes();
     
      if(notes ==  "source"){
        isSource = true;
        
        //set the name of the source contact as group name
        groupName = contacts[k].getGivenName(); 
      }
                   
      //check notes length
      if(isSource){
       break; 
      }
    }
    
    //isSources stays false if no contact with "source" as note is available
    //that means, this group isn't setup for this or not a company group
    if(isSource){
      addCompanyData(groupName);
    }
  }
}



/*
Apply address and companies name to all contacts
*/
function addCompanyData(workGroup) {
  
  var contacts = getContactList(workGroup);
  
  //contact data of the enterprise
  var enterpriceData = null;
  var compAddress;
  
  //companies data index
  var compIndex;
  
  /*
  search for contact with groups name
  which should represent the companies data
  */
  for(var m = 0; m < contacts.length; m++){
    if(contacts[m].getGivenName() == workGroup){
      enterpriceData = contacts[m];
      compAddress = enterpriceData.getAddresses()[0].getAddress();
      compIndex = m;
    } 
  }
  
  if(enterpriceData != null){
    
    for(var i = 0; i < contacts.length; i++){
      
      if(i != compIndex){
        var contact = contacts[i];
        
        /*
        If no address in available for this contact,
        add the companies address
        */
        var addr = contact.getAddresses();
        
        if(addr == null || addr.length == 0){
          
          var entAddress = enterpriceData.getAddresses();
          
          entAddress = entAddress[0];
          
          contact.addAddress("Geschäftlich("+workGroup+")",entAddress.getAddress());
          
          var comp = contact.getCompanies()[0];
          
          if(comp == null){
            comp = enterpriceData.getCompanies()[0];
            contact.addCompany(comp.getCompanyName(), "");
          }
        }else{
          /*
          if not add check if the available address is 
          the address of the company.otherwise add
          the companies address 
          */
          //if work address is from another company
          var isOtherCompany = false;
          
          //check if other business address is available
          var hasBusinessAddress = false;
          
          //store the selected (found) address index
          var addressIndex = 0;
          //check if available address is companies'
          for(var k = 0; k < addr.length; k++){
            //look for label "WORK"
            if(addr[k].getLabel() == "Geschäftlich" || addr[k].getLabel() == ContactsApp.Field.WORK_ADDRESS){
              hasBusinessAddress = true;
              //check if address is equal
              if(addr[k].getAddress() != enterpriceData.getAddresses()[0].getAddress()){
                isOtherCompany = true;
              }else{
                addressIndex = k; 
              }
            }
          }
          
          /*
          if the contact has no such address, add it 
          */
          if(hasBusinessAddress){
            //if another business address is available add the new one with label format Work(Company) to it
            if(isOtherCompany){
              contact.addAddress("Geschäftlich("+workGroup+")", compAddress);
            }else{
             //only change the label
              contact.getAddresses()[addressIndex].setLabel("Geschäftlich("+workGroup+")");
            }
          }else{
            //if no address is available just add it
            contact.addAddress("Geschäftlich("+workGroup+")", compAddress);
          }
        }
      }//index check end
    }//contacts loop end    
  }
}
