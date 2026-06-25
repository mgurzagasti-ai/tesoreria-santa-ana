/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Ventanas;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 *
 * @author jcastelli
 */
public class Conectar {
    Connection Conectar = null;
    public Connection conexion()
    {
        try {
            //Cargamos el driver mySQL
            Class.forName("com.mysql.jdbc.Driver");
            Conectar = DriverManager.getConnection("jdbc:mysql://localhost/bd_tesoreria","tesoreria","tesoreria");
        }catch (ClassNotFoundException | SQLException e){
            System.out.print(e.getMessage());
        }
        return Conectar;
    }
}
