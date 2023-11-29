"use client";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function UserMenuBar() {
  const styles = {
                  sermenu: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',  // Adjusted to start from the right end
                    padding: '10px',
                    border: '1px solid #ccc',
                    fontSize: '10px',
                    backgroundColor: '#F0F0F0' 
                  },
                  menuItem: {
                    marginRight: '4px',
                    border:"none"
                    
                  },
                  link: {
                    textDecoration: 'none', 
                  },
                };
  
  const handleCreateUsersAndItems = async () => {
    try {
      const response = await fetch('api/populate_db/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log("Populate DB clicked")
      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
      } else {
        console.error('Failed to create users and items');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
                
  return (
    <>
 <div style={styles.sermenu} data-pre="UserMenu">

      <div style={styles.menuItem} data-var="populateDatabase">
        <span style={{ margin: '4px', border:"none"}} className="prl1-sm">
          <button onClick={handleCreateUsersAndItems} style={{ border:"none"}} >Populate Database</button>
        </span>
        <span className="mr1-sm body-4" data-var="populateDatabaseSeparator">
          |
        </span>
      </div>
      
      <div style={styles.menuItem} data-var="Shop">
        <span id="" style={{margin: '4px', color: 'black'}} className="prl1-sm">
          My Items
        </span>
        <span className="mr1-sm body-4" data-var="shopSeparator">
          |
        </span>
      </div>

      <div style={styles.menuItem} data-var="Shop">
        <span id="" style={{margin: '4px', color: 'black'}} className="prl1-sm">
          Account
        </span>
        <span className="mr1-sm body-4" data-var="shopSeparator">
          |
        </span>
      </div>

      <div style={styles.menuItem} data-var="SignUpButton">
      <a href="http://localhost:8080/signup" style={{ textDecoration: 'none' }}>
          <span id="" style={{margin: '4px', color: 'black'}} className="prl1-sm">
            Sign Up 
          </span> 
        </a>
        <span className="mr1-sm body-4" data-var="SignUpButtonSeparator">
          |
        </span>
      </div>

      <div style={styles.menuItem} data-var="LoginButton">
        <a href="http://localhost:8080/login" style={{ textDecoration: 'none' }}> 
          <span id="" style={{margin: '4px', color: 'black'}} className="prl1-sm">
            Login 
          </span>
        </a>
      </div>
    </div>

    </>
  );
}

export default UserMenuBar;