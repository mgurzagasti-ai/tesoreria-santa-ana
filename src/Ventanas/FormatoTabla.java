/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Ventanas;

import java.awt.Color;
import java.awt.Component;
import javax.swing.JTable;
import javax.swing.table.DefaultTableCellRenderer;

/**
 *
 * @author tesoreria
 */
public class FormatoTabla extends DefaultTableCellRenderer{
    @Override
    public Component getTableCellRendererComponent(JTable jTable1,Object value,boolean selected, boolean focused, int row, int column){
    {
        setEnabled(jTable1 == null || jTable1.isEnabled());
        {if(String.valueOf(jTable1.getValueAt(row,3)).substring(0, 3).equals("$ -"))
            setForeground(Color.red);
        else
            setForeground(null);
        }
        super.getTableCellRendererComponent(jTable1, value, selected, focused, row, column);     
        return this;
    }
    }
}
